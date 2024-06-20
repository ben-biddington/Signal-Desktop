// Copyright 2017 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { join } from 'path';
import { realpath } from 'fs-extra';
import { randomBytes } from 'crypto';
import { pathToFileURL } from 'url';
import { isBoolean, noop } from 'lodash';
import { createParser } from 'dashdash';
import * as os from 'os';
import type { Settings } from 'electron';
import {
  app,
  BrowserWindow,
  ipcMain as ipc,
  session,
  systemPreferences,
  Notification,
  nativeTheme,
  net,
} from 'electron';

import packageJson from '../package.json';
import * as GlobalErrors from './global_errors';
import { getDNSFallback } from './dns-fallback';
import { addSensitivePath } from '../ts/util/privacy';
import { drop } from '../ts/util/drop';
import { createBufferedConsoleLogger } from '../ts/util/consoleLogger';
import * as Errors from '../ts/types/errors';
import { resolveCanonicalLocales } from '../ts/util/resolveCanonicalLocales';
import { NativeThemeNotifier } from '../ts/main/NativeThemeNotifier';
import './startup_config';

import config from './config';
import {
  Environment,
  getEnvironment,
  isTestEnvironment,
} from '../ts/environment';

// Very important to put before the single instance check, since it is based on the
//   userData directory. (see requestSingleInstanceLock below)
import * as userConfig from './user_config';

// We generally want to pull in our own modules after this point, after the user
//   data directory has been set.
import * as attachments from './attachments';
import * as bounce from '../ts/services/bounce';
import * as updater from '../ts/updater/index';
import { updateDefaultSession } from './updateDefaultSession';
import { OptionalResourceService } from './OptionalResourceService';
import {
  SystemTraySetting,
  shouldMinimizeToSystemTray,
  parseSystemTraySetting,
} from '../ts/types/SystemTraySetting';
import {
  getDefaultSystemTraySetting,
  isSystemTraySupported,
} from '../ts/types/Settings';
import * as ephemeralConfig from './ephemeral_config';
import * as logging from '../ts/logging/main_process_logging';
import * as windowState from './window_state';
import { installFileHandler, installWebHandler } from './protocol_filter';
import OS from '../ts/util/os/osMain';
import { isProduction } from '../ts/util/version';
import { SettingsChannel } from '../ts/main/settingsChannel';

import type { LocaleDirection, LocaleType } from './locale';
import { load as loadLocale } from './locale';

import type { LoggerType } from '../ts/types/Logging';
import * as dns from '../ts/util/dns';
import { setUrlSearchParams } from '../ts/util/url';
import { MainSQL } from '../ts/sql/main';
import { HourCyclePreference } from '../ts/types/I18N';
import { SystemTraySettingCache } from './SystemTraySettingCache';
import { SystemTrayService } from './SystemTrayService';
import { ThemeType } from '../ts/types/Util';
import type { ThemeSettingType } from '../ts/types/StorageUIKeys';
import { missingCaseError } from '../ts/util/missingCaseError';
import {
  directoryConfigSchema,
  rendererConfigSchema,
  RendererConfigType,
} from '../ts/types/RendererConfig';
import { clearTimeoutIfNecessary } from '../ts/util/clearTimeoutIfNecessary';

if (OS.isMacOS()) {
  systemPreferences.setUserDefault(
    'SquirrelMacEnableDirectContentsWrite',
    'boolean',
    true
  );
}

// Keep a global reference of the window object, if you don't, the window will
//   be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | undefined;
let mainWindowCreated = false;
let loadingWindow: BrowserWindow | undefined;

// Create a buffered logger to hold our log lines until we fully initialize
// the logger in `app.on('ready')`
const consoleLogger = createBufferedConsoleLogger();

// These will be set after app fires the 'ready' event
let logger: LoggerType | undefined;
let preferredSystemLocales: Array<string> | undefined;
let localeOverride: string | null | undefined;

let resolvedTranslationsLocale: LocaleType | undefined;
let settingsChannel: SettingsChannel | undefined;

const activeWindows = new Set<BrowserWindow>();
let windowIcon: string;
function getMainWindow() {
  return mainWindow;
}

const development =
  getEnvironment() === Environment.Development ||
  getEnvironment() === Environment.Staging;

const nativeThemeNotifier = new NativeThemeNotifier();
nativeThemeNotifier.initialize();

const ciMode = config.get<'full' | 'benchmark' | false>('ciMode');
const forcePreloadBundle = config.get<boolean>('forcePreloadBundle');
const localeDirectionTestingOverride = config.has(
  'localeDirectionTestingOverride'
)
  ? config.get<LocaleDirection>('localeDirectionTestingOverride')
  : null;

const mainTitleBarStyle = OS.isMacOS()
  ? ('hidden' as const)
  : ('default' as const);

const defaultWebPrefs = {
  devTools:
    process.argv.some(arg => arg === '--enable-dev-tools') ||
    getEnvironment() !== Environment.Production ||
    !isProduction(app.getVersion()),
  spellcheck: false,
  // https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/runtime_enabled_features.json5
  enableBlinkFeatures: [
    'CSSPseudoDir', // status=experimental, needed for RTL (ex: :dir(rtl))
    'CSSLogical', // status=experimental, needed for RTL (ex: margin-inline-start)
  ].join(','),
  enablePreferredSizeMode: true,
};

function getLogger(): LoggerType {
  if (!logger) {
    console.warn('getLogger: Logger not yet initialized!');
    return consoleLogger;
  }

  return logger;
}

async function safeLoadURL(window: BrowserWindow, url: string): Promise<void> {
  let wasDestroyed = false;
  const onDestroyed = () => {
    wasDestroyed = true;
  };

  window.webContents.on('did-stop-loading', onDestroyed);
  window.webContents.on('destroyed', onDestroyed);
  try {
    await window.loadURL(url);
  } catch (error) {
    if (
      (wasDestroyed || windowState.readyForShutdown()) &&
      error?.code === 'ERR_FAILED'
    ) {
      getLogger().warn(
        'safeLoadURL: ignoring ERR_FAILED because we are shutting down',
        error
      );
      return;
    }
    throw error;
  } finally {
    try {
      window.webContents.removeListener('did-stop-loading', onDestroyed);
      window.webContents.removeListener('destroyed', onDestroyed);
    } catch {
      // We already logged or thrown an error - don't bother with handling the
      // error here.
    }
  }
}

type PrepareUrlOptions = {
  forCalling?: boolean;
  forCamera?: boolean;
  sourceName?: string;
};

async function prepareFileUrl(
  pathSegments: ReadonlyArray<string>,
  options: PrepareUrlOptions = {}
): Promise<string> {
  const filePath = join(...pathSegments);
  const fileUrl = pathToFileURL(filePath) as URL;
  return prepareUrl(fileUrl, options);
}

async function prepareUrl(
  url: URL,
  { forCalling, forCamera, sourceName }: PrepareUrlOptions = {}
): Promise<string> {
  return setUrlSearchParams(url, { forCalling, forCamera, sourceName }).href;
}

function getResolvedMessagesLocale(): LocaleType {
  if (!resolvedTranslationsLocale) {
    throw new Error('getResolvedMessagesLocale: Locale not yet initialized!');
  }

  return resolvedTranslationsLocale;
}

let sqlInitTimeStart = 0;
let sqlInitTimeEnd = 0;

const sql = new MainSQL();

let sqlInitPromise:
  | Promise<{ ok: true; error: undefined } | { ok: false; error: Error }>
  | undefined;

async function initializeSQL(
  userDataPath: string
): Promise<{ ok: true; error: undefined } | { ok: false; error: Error }> {
  let key: string | undefined;
  const keyFromConfig = userConfig.get('key');
  if (typeof keyFromConfig === 'string') {
    key = keyFromConfig;
  } else if (keyFromConfig) {
    getLogger().warn(
      "initializeSQL: got key from config, but it wasn't a string"
    );
  }
  if (!key) {
    getLogger().info(
      'key/initialize: Generating new encryption key, since we did not find it on disk'
    );
    // https://www.zetetic.net/sqlcipher/sqlcipher-api/#key
    key = randomBytes(32).toString('hex');
    userConfig.set('key', key);
  }

  sqlInitTimeStart = Date.now();
  try {
    // This should be the first awaited call in this function, otherwise
    // `sql.sqlCall` will throw an uninitialized error instead of waiting for
    // init to finish.
    await sql.initialize({
      appVersion: app.getVersion(),
      configDir: userDataPath,
      key,
      logger: getLogger(),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { ok: false, error };
    }

    return {
      ok: false,
      error: new Error(`initializeSQL: Caught a non-error '${error}'`),
    };
  } finally {
    sqlInitTimeEnd = Date.now();
  }

  // Only if we've initialized things successfully do we set up the corruption handler
  // drop(runSQLCorruptionHandler());
  // drop(runSQLReadonlyHandler());

  return { ok: true, error: undefined };
}

const cliParser = createParser({
  allowUnknown: true,
  options: [
    {
      name: 'lang',
      type: 'string',
    },
  ],
});
const cliOptions = cliParser.parse(process.argv);
const CLI_LANG = cliOptions.lang as string | undefined;
let systemTrayService: SystemTrayService | undefined;

type GetThemeSettingOptionsType = Readonly<{
  ephemeralOnly?: boolean;
}>;

async function getThemeSetting({
  ephemeralOnly = false,
}: GetThemeSettingOptionsType = {}): Promise<ThemeSettingType> {
  const value = ephemeralConfig.get('theme-setting');
  if (value !== undefined) {
    getLogger().info('got fast theme-setting value', value);
  } else if (ephemeralOnly) {
    return 'system';
  }

  // Default to `system` if setting doesn't exist or is invalid
  const validatedResult =
    value === 'light' || value === 'dark' || value === 'system'
      ? value
      : 'system';

  if (value !== validatedResult) {
    ephemeralConfig.set('theme-setting', validatedResult);
    getLogger().info('saving theme-setting value', validatedResult);
  }

  return validatedResult;
}

async function getResolvedThemeSetting(
  options?: GetThemeSettingOptionsType
): Promise<ThemeType> {
  const theme = await getThemeSetting(options);
  if (theme === 'system') {
    return nativeTheme.shouldUseDarkColors ? ThemeType.dark : ThemeType.light;
  }
  return ThemeType[theme];
}

async function getBackgroundColor(
  options?: GetThemeSettingOptionsType
): Promise<string> {
  const theme = await getResolvedThemeSetting(options);

  if (theme === 'light') {
    return '#3a76f0';
  }

  if (theme === 'dark') {
    return '#121212';
  }

  throw missingCaseError(theme);
}

function loadPreferredSystemLocales(): Array<string> {
  if (CLI_LANG != null) {
    try {
      // Normalizes locales so its safe to pass them into Intl apis.
      return Intl.getCanonicalLocales(CLI_LANG);
    } catch {
      // Ignore, totally invalid locale, fallback to system languages.
    }
  }

  if (getEnvironment() === Environment.Test) {
    return ['en'];
  }

  return app.getPreferredSystemLanguages();
}

async function getLocaleOverrideSetting(): Promise<string | null> {
  const value = ephemeralConfig.get('localeOverride');
  // eslint-disable-next-line eqeqeq -- Checking for null explicitly
  if (typeof value === 'string' || value === null) {
    getLogger().info('got fast localeOverride setting', value);
    return value;
  }

  // Default to `null` if setting doesn't exist yet
  ephemeralConfig.set('localeOverride', null);

  getLogger().info('initializing localeOverride setting', null);

  return null;
}

function getHourCyclePreference(): HourCyclePreference {
  if (process.platform !== 'darwin') {
    return HourCyclePreference.UnknownPreference;
  }
  if (systemPreferences.getUserDefault('AppleICUForce24HourTime', 'boolean')) {
    return HourCyclePreference.Prefer24;
  }
  if (systemPreferences.getUserDefault('AppleICUForce12HourTime', 'boolean')) {
    return HourCyclePreference.Prefer12;
  }
  return HourCyclePreference.UnknownPreference;
}

const systemTraySettingCache = new SystemTraySettingCache(
  ephemeralConfig,
  process.argv
);

let ready = false;
const DISABLE_IPV6 = process.argv.some(arg => arg === '--disable-ipv6');

async function getDefaultLoginItemSettings(): Promise<Settings> {
  if (!OS.isWindows()) {
    return {};
  }

  const systemTraySetting = await systemTraySettingCache.get();
  if (
    systemTraySetting !== SystemTraySetting.MinimizeToSystemTray &&
    // This is true when we just started with `--start-in-tray`
    systemTraySetting !== SystemTraySetting.MinimizeToAndStartInSystemTray
  ) {
    return {};
  }

  // The effect of this is that if both auto-launch and minimize to system tray
  // are enabled on Windows - we will start the app in tray automatically,
  // letting the Desktop shortcuts still start the Signal not in tray.
  return { args: ['--start-in-tray'] };
}

const startInTray = false;

//
// Startshere
//
app.on('ready', async () => {
  logger = await logging.initialize(getMainWindow);

  logger.info('app.ready');

  dns.setFallback(await getDNSFallback());
  if (DISABLE_IPV6) {
    dns.setIPv6Enabled(false);
  }

  const [userDataPath, crashDumpsPath, installPath] = await Promise.all([
    realpath(app.getPath('userData')),
    realpath(app.getPath('crashDumps')),
    realpath(app.getAppPath()),
  ]);

  updateDefaultSession(session.defaultSession);

  if (getEnvironment() !== Environment.Test) {
    installFileHandler({
      session: session.defaultSession,
      userDataPath,
      installPath,
      isWindows: OS.isWindows(),
    });
  }

  installWebHandler({
    enableHttp: Boolean(process.env.SIGNAL_ENABLE_HTTP),
    session: session.defaultSession,
  });

  // Write buffered information into newly created logger.
  consoleLogger.writeBufferInto(logger);

  OptionalResourceService.create(join(userDataPath, 'optionalResources'));

  sqlInitPromise = initializeSQL(userDataPath);

  if (!resolvedTranslationsLocale) {
    preferredSystemLocales = resolveCanonicalLocales(
      loadPreferredSystemLocales()
    );

    localeOverride = await getLocaleOverrideSetting();

    const hourCyclePreference = getHourCyclePreference();
    logger.info(`app.ready: hour cycle preference: ${hourCyclePreference}`);

    logger.info(
      `app.ready: preferred system locales: ${preferredSystemLocales.join(
        ', '
      )}`
    );
    resolvedTranslationsLocale = loadLocale({
      preferredSystemLocales,
      localeOverride,
      localeDirectionTestingOverride,
      hourCyclePreference,
      logger: getLogger(),
    });
  }

  // First run: configure Signal to minimize to tray. Additionally, on Windows
  // enable auto-start with start-in-tray so that starting from a Desktop icon
  // would still show the window.
  // (User can change these settings later)
  if (
    isSystemTraySupported(OS) &&
    (await systemTraySettingCache.get()) === SystemTraySetting.Uninitialized
  ) {
    const newValue = getDefaultSystemTraySetting(OS, app.getVersion());
    getLogger().info(`app.ready: setting system-tray-setting to ${newValue}`);
    systemTraySettingCache.set(newValue);

    ephemeralConfig.set('system-tray-setting', newValue);

    if (OS.isWindows()) {
      getLogger().info('app.ready: enabling open at login');
      app.setLoginItemSettings({
        ...(await getDefaultLoginItemSettings()),
        openAtLogin: true,
      });
    }
  }

  const startTime = Date.now();

  settingsChannel = new SettingsChannel();
  settingsChannel.install();

  settingsChannel.on('change:systemTraySetting', async rawSystemTraySetting => {
    const { openAtLogin } = app.getLoginItemSettings(
      await getDefaultLoginItemSettings()
    );

    const systemTraySetting = parseSystemTraySetting(rawSystemTraySetting);
    systemTraySettingCache.set(systemTraySetting);

    if (systemTrayService) {
      const isEnabled = shouldMinimizeToSystemTray(systemTraySetting);
      systemTrayService.setEnabled(isEnabled);
    }

    // Default login item settings might have changed, so update the object.
    getLogger().info('refresh-auto-launch: new value', openAtLogin);
    app.setLoginItemSettings({
      ...(await getDefaultLoginItemSettings()),
      openAtLogin,
    });
  });

  // settingsChannel.on(
  //   'ephemeral-setting-changed',
  //   sendPreferencesChangedEventToWindows
  // );

  // We use this event only a single time to log the startup time of the app
  // from when it's first ready until the loading screen disappears.
  ipc.once('signal-app-loaded', (event, info) => {
    const { preloadTime, connectTime, processedCount } = info;

    const loadTime = Date.now() - startTime;
    const sqlInitTime = sqlInitTimeEnd - sqlInitTimeStart;

    const messageTime = loadTime - preloadTime - connectTime;
    const messagesPerSec = (processedCount * 1000) / messageTime;

    const innerLogger = getLogger();
    innerLogger.info('App loaded - time:', loadTime);
    innerLogger.info('SQL init - time:', sqlInitTime);
    innerLogger.info('Preload - time:', preloadTime);
    innerLogger.info('WebSocket connect - time:', connectTime);
    innerLogger.info('Processed count:', processedCount);
    innerLogger.info('Messages per second:', messagesPerSec);

    event.sender.send('ci:event', 'app-loaded', {
      loadTime,
      sqlInitTime,
      preloadTime,
      connectTime,
      processedCount,
      messagesPerSec,
    });
  });

  addSensitivePath(userDataPath);
  addSensitivePath(crashDumpsPath);

  if (getEnvironment() !== Environment.Test) {
    installFileHandler({
      session: session.defaultSession,
      userDataPath,
      installPath,
      isWindows: OS.isWindows(),
    });
  }

  logger.info('app ready');
  logger.info(`starting version ${packageJson.version}`);

  // This logging helps us debug user reports about broken devices.
  {
    let getMediaAccessStatus;
    // This function is not supported on Linux, so we have a fallback.
    if (systemPreferences.getMediaAccessStatus) {
      getMediaAccessStatus =
        systemPreferences.getMediaAccessStatus.bind(systemPreferences);
    } else {
      getMediaAccessStatus = noop;
    }
    logger.info(
      'media access status',
      getMediaAccessStatus('microphone'),
      getMediaAccessStatus('camera')
    );
  }

  GlobalErrors.updateLocale(resolvedTranslationsLocale);

  // If the sql initialization takes more than three seconds to complete, we
  // want to notify the user that things are happening
  const timeout = new Promise(resolveFn =>
    setTimeout(resolveFn, 3000, 'timeout')
  );

  // This color is to be used only in loading screen and in this case we should
  // never wait for the database to be initialized. Thus the theme setting
  // lookup should be done only in ephemeral config.
  const backgroundColor = await getBackgroundColor({ ephemeralOnly: true });

  drop(
    // eslint-disable-next-line more/no-then
    Promise.race([sqlInitPromise, timeout]).then(async maybeTimeout => {
      if (maybeTimeout !== 'timeout') {
        return;
      }

      getLogger().info(
        'sql.initialize is taking more than three seconds; showing loading dialog'
      );

      loadingWindow = new BrowserWindow({
        show: false,
        width: 300,
        height: 280,
        resizable: false,
        frame: false,
        backgroundColor,
        webPreferences: {
          ...defaultWebPrefs,
          nodeIntegration: false,
          sandbox: true,
          contextIsolation: true,
          preload: join(__dirname, '../bundles/loading/preload.js'),
        },
        icon: windowIcon,
      });

      loadingWindow.once('ready-to-show', async () => {
        if (!loadingWindow) {
          return;
        }
        loadingWindow.show();
        // Wait for sql initialization to complete, but ignore errors
        await sqlInitPromise;
        loadingWindow.destroy();
        loadingWindow = undefined;
      });

      await safeLoadURL(
        loadingWindow,
        await prepareFileUrl([__dirname, '../loading.html'])
      );
    })
  );

  try {
    await attachments.clearTempPath(userDataPath);
  } catch (err) {
    logger.error(
      'main/ready: Error deleting temp dir:',
      Errors.toLogFormat(err)
    );
  }

  // Initialize IPC channels before creating the window

  // attachmentChannel.initialize({
  //   sql,
  //   configDir: userDataPath,
  // });
  // sqlChannels.initialize(sql);
  // PowerChannel.initialize({
  //   send(event) {
  //     if (!mainWindow) {
  //       return;
  //     }
  //     mainWindow.webContents.send(event);
  //   },
  // });

  // Run window preloading in parallel with database initialization.
  await createWindow();

  await sqlInitPromise;
  // if (sqlError) {
  //   getLogger().error('sql.initialize was unsuccessful; returning early');

  //   await onDatabaseError(Errors.toLogFormat(sqlError));

  //   return;
  // }

  // appStartInitialSpellcheckSetting = await getSpellCheckSetting();

  // try {
  //   const IDB_KEY = 'indexeddb-delete-needed';
  //   const item = await sql.sqlCall('getItemById', IDB_KEY);
  //   if (item && item.value) {
  //     await sql.sqlCall('removeIndexedDBFiles');
  //     await sql.sqlCall('removeItemById', IDB_KEY);
  //   }
  // } catch (err) {
  //   getLogger().error(
  //     '(ready event handler) error deleting IndexedDB:',
  //     Errors.toLogFormat(err)
  //   );
  // }

  ready = true;

  // setupMenu();

  systemTrayService = new SystemTrayService({
    i18n: resolvedTranslationsLocale.i18n,
  });
  systemTrayService.setMainWindow(mainWindow);
  systemTrayService.setEnabled(
    shouldMinimizeToSystemTray(await systemTraySettingCache.get())
  );

  // await ensureFilePermissions([
  //   'config.json',
  //   'sql/db.sqlite',
  //   'sql/db.sqlite-wal',
  //   'sql/db.sqlite-shm',
  // ]);
});

async function requestShutdown() {
  if (!mainWindow || !mainWindow.webContents) {
    return;
  }

  getLogger().info('requestShutdown: Requesting close of mainWindow...');
  const request = new Promise<void>(resolveFn => {
    let timeout: NodeJS.Timeout | undefined;

    if (!mainWindow) {
      resolveFn();
      return;
    }

    ipc.once('now-ready-for-shutdown', (_event, error) => {
      getLogger().info('requestShutdown: Response received');

      if (error) {
        getLogger().error(
          'requestShutdown: got error, still shutting down.',
          error
        );
      }
      clearTimeoutIfNecessary(timeout);

      resolveFn();
    });

    mainWindow.webContents.send('get-ready-for-shutdown');

    // We'll wait two minutes, then force the app to go down. This can happen if someone
    //   exits the app before we've set everything up in preload() (so the browser isn't
    //   yet listening for these events), or if there are a whole lot of stacked-up tasks.
    // Note: two minutes is also our timeout for SQL tasks in data.js in the browser.
    timeout = setTimeout(() => {
      getLogger().error(
        'requestShutdown: Response never received; forcing shutdown.'
      );
      resolveFn();
    }, 2 * 60 * 1000);
  });

  try {
    await request;
  } catch (error) {
    getLogger().error('requestShutdown error:', Errors.toLogFormat(error));
  }
}

async function maybeRequestCloseConfirmation(): Promise<boolean> {
  if (!mainWindow || !mainWindow.webContents) {
    return true;
  }

  getLogger().info(
    'maybeRequestCloseConfirmation: Checking to see if close confirmation is needed'
  );
  const request = new Promise<boolean>(resolveFn => {
    let timeout: NodeJS.Timeout | undefined;

    if (!mainWindow) {
      resolveFn(true);
      return;
    }

    ipc.once('received-close-confirmation', (_event, result) => {
      getLogger().info('maybeRequestCloseConfirmation: Response received');

      clearTimeoutIfNecessary(timeout);
      resolveFn(result);
    });

    ipc.once('requested-close-confirmation', () => {
      getLogger().info(
        'maybeRequestCloseConfirmation: Confirmation dialog shown, waiting for user.'
      );
      clearTimeoutIfNecessary(timeout);
    });

    mainWindow.webContents.send('maybe-request-close-confirmation');

    // Wait a short time then proceed. Normally the dialog should be
    // shown right away.
    timeout = setTimeout(() => {
      getLogger().error(
        'maybeRequestCloseConfirmation: Response never received; continuing with close.'
      );
      resolveFn(true);
    }, 10 * 1000);
  });

  try {
    return await request;
  } catch (error) {
    getLogger().error(
      'maybeRequestCloseConfirmation error:',
      Errors.toLogFormat(error)
    );
    return true;
  }
}

async function createWindow() {
  const usePreloadBundle =
    !isTestEnvironment(getEnvironment()) || forcePreloadBundle;

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    show: false,
    titleBarStyle: mainTitleBarStyle,
    webPreferences: {
      ...defaultWebPrefs,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      sandbox: false,
      contextIsolation: !isTestEnvironment(getEnvironment()),
      preload: join(
        __dirname,
        usePreloadBundle
          ? '../preload.bundle.js'
          : '../ts/windows/main/preload.js'
      ),
      backgroundThrottling: true,
      disableBlinkFeatures: 'Accelerated2dCanvas,AcceleratedSmallCanvases',
    },
  };

  if (!isBoolean(windowOptions.autoHideMenuBar)) {
    delete windowOptions.autoHideMenuBar;
  }

  getLogger().info(
    'Initializing BrowserWindow config:',
    JSON.stringify(windowOptions)
  );

  // Create the browser window.
  mainWindow = new BrowserWindow(windowOptions);
  if (settingsChannel) {
    settingsChannel.setMainWindow(mainWindow);
  }

  mainWindowCreated = true;

  if (!ciMode && config.get<boolean>('openDevTools')) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  // App dock icon bounce
  bounce.init(mainWindow);

  mainWindow.on('hide', () => {
    if (mainWindow && !windowState.shouldQuit()) {
      mainWindow.webContents.send('set-media-playback-disabled', true);
    }
  });

  // Emitted when the window is about to be closed.
  // Note: We do most of our shutdown logic here because all windows are closed by
  //   Electron before the app quits.
  mainWindow.on('close', async e => {
    if (!mainWindow) {
      getLogger().info('close event: no main window');
      return;
    }

    getLogger().info('close event', {
      readyForShutdown: windowState.readyForShutdown(),
      shouldQuit: windowState.shouldQuit(),
    });
    // If the application is terminating, just do the default
    if (
      isTestEnvironment(getEnvironment()) ||
      (windowState.readyForShutdown() && windowState.shouldQuit())
    ) {
      return;
    }

    // Prevent the shutdown
    e.preventDefault();

    // In certain cases such as during an active call, we ask the user to confirm close
    // which includes shutdown, clicking X on MacOS or closing to tray.
    let shouldClose = true;
    try {
      shouldClose = await maybeRequestCloseConfirmation();
    } catch (error) {
      getLogger().warn(
        'Error while requesting close confirmation.',
        Errors.toLogFormat(error)
      );
    }
    if (!shouldClose) {
      updater.onRestartCancelled();
      return;
    }

    /**
     * if the user is in fullscreen mode and closes the window, not the
     * application, we need them leave fullscreen first before closing it to
     * prevent a black screen.
     *
     * issue: https://github.com/signalapp/Signal-Desktop/issues/4348
     */

    if (mainWindow.isFullScreen()) {
      mainWindow.once('leave-full-screen', () => mainWindow?.hide());
      mainWindow.setFullScreen(false);
    } else {
      mainWindow.hide();
    }

    // On Mac, or on other platforms when the tray icon is in use, the window
    // should be only hidden, not closed, when the user clicks the close button
    const usingTrayIcon = shouldMinimizeToSystemTray(
      await systemTraySettingCache.get()
    );
    if (!windowState.shouldQuit() && (usingTrayIcon || OS.isMacOS())) {
      if (usingTrayIcon) {
        const shownTrayNotice = ephemeralConfig.get('shown-tray-notice');
        if (shownTrayNotice) {
          getLogger().info('close: not showing tray notice');
          return;
        }

        ephemeralConfig.set('shown-tray-notice', true);
        getLogger().info('close: showing tray notice');

        const n = new Notification({
          title: getResolvedMessagesLocale().i18n(
            'icu:minimizeToTrayNotification--title'
          ),
          body: getResolvedMessagesLocale().i18n(
            'icu:minimizeToTrayNotification--body'
          ),
        });

        n.show();
      }
      return;
    }

    windowState.markRequestedShutdown();
    await requestShutdown();
    windowState.markReadyForShutdown();

    await sql.close();
    app.quit();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    getLogger().info('main window closed event');
    mainWindow = undefined;
    if (settingsChannel) {
      settingsChannel.setMainWindow(mainWindow);
    }
    if (systemTrayService) {
      systemTrayService.setMainWindow(mainWindow);
    }
  });

  mainWindow.on('enter-full-screen', () => {
    getLogger().info('mainWindow enter-full-screen event');
    if (mainWindow) {
      mainWindow.webContents.send('full-screen-change', true);
    }
  });
  mainWindow.on('leave-full-screen', () => {
    getLogger().info('mainWindow leave-full-screen event');
    if (mainWindow) {
      mainWindow.webContents.send('full-screen-change', false);
    }
  });

  mainWindow.on('show', () => {
    if (mainWindow) {
      mainWindow.webContents.send('set-media-playback-disabled', false);
    }
  });

  mainWindow.once('ready-to-show', async () => {
    getLogger().info('main window is ready-to-show');

    // Ignore sql errors and show the window anyway
    await sqlInitPromise;

    if (!mainWindow) {
      return;
    }

    mainWindow.webContents.send('ci:event', 'db-initialized', {});

    getLogger().info('showing main window');
    mainWindow.show();
  });

  getLogger().info('Loading window with document');
  await safeLoadURL(
    mainWindow,
    getEnvironment() === Environment.Test
      ? await prepareFileUrl([__dirname, '../test/index.html'])
      : await prepareFileUrl([__dirname, '../background.html'])
  );
}

ipc.on('locale-data', event => {
  // eslint-disable-next-line no-param-reassign
  event.returnValue = getResolvedMessagesLocale().messages;
});

// Ingested in preload.js via a sendSync call
ipc.on('locale-display-names', event => {
  // eslint-disable-next-line no-param-reassign
  event.returnValue = getResolvedMessagesLocale().localeDisplayNames;
});

// Ingested in preload.js via a sendSync call
ipc.on('country-display-names', event => {
  // eslint-disable-next-line no-param-reassign
  event.returnValue = getResolvedMessagesLocale().countryDisplayNames;
});

// TODO DESKTOP-5241
ipc.on('OS.getClassName', event => {
  // eslint-disable-next-line no-param-reassign
  event.returnValue = OS.getClassName();
});

ipc.on('get-user-data-path', event => {
  // eslint-disable-next-line no-param-reassign
  event.returnValue = app.getPath('userData');
});

ipc.handle('sql-channel', (_event, callName, ...args) => {
  return sql.sqlCall(callName, ...args);
});

ipc.handle('getZoomFactor', () => 100);

ipc.handle('getMainWindowStats', async () => {
  return {
    isMaximized: false,
    isFullScreen: false,
  };
});

ipc.handle(
  'net.resolveHost',
  (_event, hostname: string, queryType?: 'A' | 'AAAA') => {
    return net.resolveHost(hostname, {
      queryType,
    });
  }
);

ipc.handle('getMenuOptions', () => {
  return {
    development: true,
    devTools: true,
    includeSetup: true,
    isProduction: true,
    platform: 'unknown',
  };
});

ipc.on('get-config', async event => {
  const theme = await getResolvedThemeSetting();

  const directoryConfig = directoryConfigSchema.safeParse({
    directoryUrl: config.get<string | null>('directoryUrl') || undefined,
    directoryMRENCLAVE:
      config.get<string | null>('directoryMRENCLAVE') || undefined,
  });
  if (!directoryConfig.success) {
    throw new Error(
      `prepareUrl: Failed to parse renderer directory config ${JSON.stringify(
        directoryConfig.error.flatten()
      )}`
    );
  }

  const parsed = rendererConfigSchema.safeParse({
    name: packageJson.productName,
    availableLocales: getResolvedMessagesLocale().availableLocales,
    resolvedTranslationsLocale: getResolvedMessagesLocale().name,
    resolvedTranslationsLocaleDirection: getResolvedMessagesLocale().direction,
    hourCyclePreference: getResolvedMessagesLocale().hourCyclePreference,
    preferredSystemLocales: getPreferredSystemLocales(),
    localeOverride: getLocaleOverride(),
    version: app.getVersion(),
    buildCreation: config.get<number>('buildCreation'),
    buildExpiration: config.get<number>('buildExpiration'),
    challengeUrl: config.get<string>('challengeUrl'),
    serverUrl: config.get<string>('serverUrl'),
    storageUrl: config.get<string>('storageUrl'),
    updatesUrl: config.get<string>('updatesUrl'),
    resourcesUrl: config.get<string>('resourcesUrl'),
    cdnUrl0: config.get<string>('cdn.0'),
    cdnUrl2: config.get<string>('cdn.2'),
    cdnUrl3: config.get<string>('cdn.3'),
    certificateAuthority: config.get<string>('certificateAuthority'),
    environment:
      !isTestEnvironment(getEnvironment()) && ciMode
        ? Environment.Production
        : getEnvironment(),
    isMockTestEnvironment: Boolean(process.env.MOCK_TEST),
    ciMode,
    // Should be already computed and cached at this point
    dnsFallback: await getDNSFallback(),
    disableIPv6: DISABLE_IPV6,
    ciBackupPath: config.get<string | null>('ciBackupPath') || undefined,
    nodeVersion: process.versions.node,
    hostname: os.hostname(),
    osRelease: os.release(),
    osVersion: os.version(),
    appInstance: process.env.NODE_APP_INSTANCE || undefined,
    proxyUrl: process.env.HTTPS_PROXY || process.env.https_proxy || undefined,
    contentProxyUrl: config.get<string>('contentProxyUrl'),
    sfuUrl: config.get('sfuUrl'),
    reducedMotionSetting: true, // DISABLE_GPU || animationSettings.prefersReducedMotion,
    registrationChallengeUrl: config.get<string>('registrationChallengeUrl'),
    serverPublicParams: config.get<string>('serverPublicParams'),
    serverTrustRoot: config.get<string>('serverTrustRoot'),
    genericServerPublicParams: config.get<string>('genericServerPublicParams'),
    backupServerPublicParams: config.get<string>('backupServerPublicParams'),
    theme,
    appStartInitialSpellcheckSetting: true,

    // paths
    crashDumpsPath: app.getPath('crashDumps'),
    homePath: app.getPath('home'),
    installPath: app.getAppPath(),
    userDataPath: app.getPath('userData'),

    directoryConfig: directoryConfig.data,

    // Only used by the main window
    isMainWindowFullScreen: Boolean(mainWindow?.isFullScreen()),
    isMainWindowMaximized: Boolean(mainWindow?.isMaximized()),

    // Only for tests
    argv: JSON.stringify(process.argv),
  } satisfies RendererConfigType);

  if (!parsed.success) {
    throw new Error(
      `prepareUrl: Failed to parse renderer config ${JSON.stringify(
        parsed.error.flatten()
      )}`
    );
  }

  // eslint-disable-next-line no-param-reassign
  event.returnValue = parsed.data;
});

function getPreferredSystemLocales(): Array<string> {
  if (!preferredSystemLocales) {
    throw new Error('getPreferredSystemLocales: Locales not yet initialized!');
  }
  return preferredSystemLocales;
}

function getLocaleOverride(): string | null {
  if (typeof localeOverride === 'undefined') {
    throw new Error('getLocaleOverride: Locale not yet initialized!');
  }
  return localeOverride;
}

// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

// Captures the globals put in place by preload.js, background.js and others

import type { Store } from 'redux';
import type * as Backbone from 'backbone';
import type PQueue from 'p-queue/dist';
import type { assert } from 'chai';
import type { PhoneNumber, PhoneNumberFormat } from 'google-libphonenumber';
import type { MochaOptions } from 'mocha';

import type { ConversationModelCollectionType } from './model-types.d';
import type { IPCRequest as IPCChallengeRequest } from './challenge';
import type AccountManager from './textsecure/AccountManager';
import type { WebAPIConnectType } from './textsecure/WebAPI';
import type { getEnvironment } from './environment';
import type { LocalizerType, ThemeType } from './types/Util';
import type { Receipt } from './types/Receipt';
import type { ReduxActions } from './state/types';
import type { MessageModel } from './models/messages';
import type { ConversationModel } from './models/conversations';
import type { BatcherType } from './util/batcher';
import type { SignalProtocolStore } from './SignalProtocolStore';
import type { SocketStatus } from './types/SocketStatus';
import type SyncRequest from './textsecure/SyncRequest';
import type { MessageCache } from './services/MessageCache';
import type { StateType } from './state/reducer';
import type { CIType } from './CI';
import type { IPCEventsType } from './util/createIPCEvents';
import type { SignalContextType } from './windows/context';
import type { WindowsNotificationData } from './services/notifications';
import type { IStorage } from './ports/IStorage';
import type { IConversationController } from './ports/IConversationController';
import type { TextSecureType } from './textsecure';
import { SignalCoreType } from './SignalCoreType';

export { Long } from 'long';

export type IPCType = {
  addSetupMenuItems: () => void;
  clearAllWindowsNotifications: () => Promise<void>;
  closeAbout: () => void;
  crashReports: {
    getCount: () => Promise<number>;
    writeToLog: () => Promise<void>;
    erase: () => Promise<void>;
  };
  drawAttention: () => void;
  getAutoLaunch: () => Promise<boolean>;
  getMediaAccessStatus: (
    mediaType: 'screen' | 'microphone' | 'camera'
  ) => Promise<string | undefined>;
  getMediaCameraPermissions: () => Promise<boolean>;
  getMediaPermissions: () => Promise<boolean>;
  logAppLoadedEvent?: (options: { processedCount?: number }) => void;
  readyForUpdates: () => void;
  removeSetupMenuItems: () => unknown;
  setAutoHideMenuBar: (value: boolean) => void;
  setAutoLaunch: (value: boolean) => Promise<void>;
  setBadge: (badge: number | 'marked-unread') => void;
  setMenuBarVisibility: (value: boolean) => void;
  showDebugLog: () => void;
  showPermissionsPopup: (
    forCalling: boolean,
    forCamera: boolean
  ) => Promise<void>;
  showSettings: () => void;
  showWindow: () => void;
  showWindowsNotification: (data: WindowsNotificationData) => Promise<void>;
  shutdown: () => void;
  titleBarDoubleClick: () => void;
  updateTrayIcon: (count: number) => void;
};

export type FeatureFlagType = {
  GV2_ENABLE_SINGLE_CHANGE_PROCESSING: boolean;
  GV2_ENABLE_CHANGE_PROCESSING: boolean;
  GV2_ENABLE_STATE_PROCESSING: boolean;
  GV2_ENABLE_PRE_JOIN_FETCH: boolean;
  GV2_MIGRATION_DISABLE_ADD: boolean;
  GV2_MIGRATION_DISABLE_INVITE: boolean;
};

declare global {
  // We want to extend various globals, so we need to use interfaces.
  /* eslint-disable no-restricted-syntax */
  interface Window {
    // Used in Sticker Creator to create proper paths to emoji images
    ROOT_PATH?: string;
    // Used for sticker creator localization
    localeMessages: { [key: string]: { message: string } };

    openArtCreator: (opts: { username: string; password: string }) => void;

    enterKeyboardMode: () => void;
    enterMouseMode: () => void;
    getAccountManager: () => AccountManager;
    getAppInstance: () => string | undefined;
    getConversations: () => ConversationModelCollectionType;
    getBuildCreation: () => number;
    getBuildExpiration: () => number;
    getEnvironment: typeof getEnvironment;
    getHostName: () => string;
    getInteractionMode: () => 'mouse' | 'keyboard';
    getServerPublicParams: () => string;
    getGenericServerPublicParams: () => string;
    getBackupServerPublicParams: () => string;
    getSfuUrl: () => string;
    getIceServerOverride: () => string;
    getSocketStatus: () => SocketStatus;
    getSyncRequest: (timeoutMillis?: number) => SyncRequest;
    getTitle: () => string;
    waitForEmptyEventQueue: () => Promise<void>;
    getVersion: () => string;
    isAfterVersion: (version: string, anotherVersion: string) => boolean;
    isBeforeVersion: (version: string, anotherVersion: string) => boolean;
    initialTheme?: ThemeType;
    libphonenumberInstance: {
      parse: (number: string) => PhoneNumber;
      getRegionCodeForNumber: (number: PhoneNumber) => string | undefined;
      format: (number: PhoneNumber, format: PhoneNumberFormat) => string;
    };
    libphonenumberFormat: typeof PhoneNumberFormat;
    nodeSetImmediate: typeof setImmediate;
    platform: string;
    preloadedImages: Array<HTMLImageElement>;
    setImmediate: typeof setImmediate;
    sendChallengeRequest: (request: IPCChallengeRequest) => void;
    showKeyboardShortcuts: () => void;
    storage: IStorage;
    systemTheme: ThemeType;

    Signal: SignalCoreType;

    getServerTrustRoot: () => string;
    logAuthenticatedConnect?: () => void;

    // ========================================================================
    // The types below have been somewhat organized. See DESKTOP-4801
    // ========================================================================

    // Backbone
    Backbone: typeof Backbone;

    ConversationController: IConversationController;
    Events: IPCEventsType;
    FontFace: typeof FontFace;
    MessageCache: MessageCache;
    SignalProtocolStore: typeof SignalProtocolStore;
    WebAPI: WebAPIConnectType;
    Whisper: WhisperType;
    getSignalProtocolStore: () => SignalProtocolStore;
    i18n: LocalizerType;
    // Note: used in background.html, and not type-checked
    startApp: () => void;
    textsecure: TextSecureType;
    useDevNull?: boolean;

    // IPC
    IPC: IPCType;

    // State
    reduxActions: ReduxActions;
    reduxStore: Store<StateType>;

    // Feature Flags
    Flags: FeatureFlagType;

    // Paths
    BasePaths: {
      attachments: string;
      draft: string;
      stickers: string;
      temp: string;
    };

    // Test only
    SignalCI?: CIType;

    // TODO DESKTOP-4801
    SignalContext: SignalContextType;

    // Used only in preload to calculate load time
    preloadStartTime: number;
    preloadEndTime: number;

    // Test only
    RETRY_DELAY: boolean;
    assert: typeof assert;
    testUtilities: {
      setup: MochaOptions;
      debug: (info: unknown) => void;
      onTestEvent: (event: unknown) => void;
      initialize: () => Promise<void>;
      prepareTests: () => void;
    };
  }

  interface Element {
    // WebKit-specific
    scrollIntoViewIfNeeded: (bringToCenter?: boolean) => void;
  }

  // Uint8Array and ArrayBuffer are type-compatible in TypeScript's covariant
  // type checker, but in reality they are not. Let's assert correct use!
  interface Uint8Array {
    __uint8array: never;
  }

  interface ArrayBuffer {
    __arrayBuffer: never;
  }

  interface SharedArrayBuffer {
    __arrayBuffer: never;
  }
}

export type WhisperType = {
  Conversation: typeof ConversationModel;
  ConversationCollection: typeof ConversationModelCollectionType;
  Message: typeof MessageModel;

  deliveryReceiptQueue: PQueue;
  deliveryReceiptBatcher: BatcherType<Receipt>;
  events: Backbone.Events;
};

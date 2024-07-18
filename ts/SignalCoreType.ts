import type PQueue from 'p-queue';
import type * as Curve from './Curve';
import type Data from './sql/Client';
import type * as Groups from './groups';
import type { ScreenShareStatus } from './types/Calling';
import type { ICalling } from './ports/ICalling';
import type { BackupsService } from './services/backups';
import type { ReduxActions } from './state/types';
import type { RetryPlaceholders } from './util/retryPlaceholders';
import type * as StorageService from './services/storage';
import type { PropsPreloadType as PreferencesPropsType } from './components/Preferences';
import type * as RemoteConfig from './RemoteConfig';
import type { initializeMigrations } from './signal';
import type * as Message2 from './types/Message2';
import type { Address } from './types/Address';
import type { QualifiedAddress } from './types/QualifiedAddress';
import type { ConfirmationDialog } from './components/ConfirmationDialog';
import type { OSType } from './util/os/shared';
import type { createApp } from './state/roots/createApp';
import type { ChallengeHandler } from './challenge';

export type SignalCoreType = {
  init?: () => Promise<void>;
  AboutWindowProps?: AboutWindowPropsType;
  Crypto: typeof Crypto;
  Curve: typeof Curve;
  Data: typeof Data;
  DebugLogWindowProps?: DebugLogWindowPropsType;
  Groups: typeof Groups;
  PermissionsWindowProps?: PermissionsWindowPropsType;
  RemoteConfig: typeof RemoteConfig;
  ScreenShareWindowProps?: ScreenShareWindowPropsType;
  Services: {
    calling: ICalling;
    backups: BackupsService;
    initializeGroupCredentialFetcher: () => Promise<void>;
    initializeNetworkObserver: (network: ReduxActions['network']) => void;
    initializeUpdateListener: (updates: ReduxActions['updates']) => void;
    retryPlaceholders?: RetryPlaceholders;
    lightSessionResetQueue?: PQueue;
    storage: typeof StorageService;
  };
  SettingsWindowProps?: SettingsWindowPropsType;
  Migrations: ReturnType<typeof initializeMigrations>;
  Types: {
    Message: typeof Message2;
    Address: typeof Address;
    QualifiedAddress: typeof QualifiedAddress;
  };
  Components: {
    ConfirmationDialog: typeof ConfirmationDialog;
  };
  OS: OSType;
  State: {
    Roots: {
      createApp: typeof createApp;
    };
  };
  conversationControllerStart: () => void;
  challengeHandler?: ChallengeHandler;
};

type AboutWindowPropsType = {
  arch: string;
  environmentText: string;
  platform: string;
};

type DebugLogWindowPropsType = {
  downloadLog: (text: string) => unknown;
  fetchLogs: () => Promise<string>;
  uploadLogs: (text: string) => Promise<string>;
};

type PermissionsWindowPropsType = {
  forCamera: boolean;
  forCalling: boolean;
  onAccept: () => void;
  onClose: () => void;
};

type ScreenShareWindowPropsType = {
  onStopSharing: () => void;
  presentedSourceName: string;
  getStatus: () => ScreenShareStatus;
  setRenderCallback: (cb: () => void) => void;
};

type SettingsWindowPropsType = {
  onRender: (callback: SettingsOnRenderCallbackType) => void;
};

type SettingsOnRenderCallbackType = (props: PreferencesPropsType) => void;

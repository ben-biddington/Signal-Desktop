import type { ConfirmNumberResultType } from '../textsecure/AccountManager';
import { EventHandler } from '../textsecure/EventTarget';
import type { KeyPairType, PniKeyMaterialType } from '../textsecure/Types';
import type { PniString, ServiceIdKind } from '../types/ServiceId';

export type IAccountManager = {
  encryptDeviceName: (
    name: string,
    identityKey: KeyPairType
  ) => string | undefined;

  decryptDeviceName: (base64: string) => Promise<string>;

  maybeUpdateDeviceName: () => Promise<void>;

  deviceNameIsEncrypted: () => Promise<void>;

  registerSingleDevice: (
    number: string,
    verificationCode: string,
    sessionId: string
  ) => Promise<void>;

  registerSecondDevice: (
    setProvisioningUrl: (url: string) => void,
    confirmNumber: (number?: string) => Promise<ConfirmNumberResultType>
  ) => Promise<void>;

  maybeUpdateKeys: (
    serviceIdKind: ServiceIdKind,
    forceUpdate?: boolean
  ) => Promise<void>;

  areKeysOutOfDate: (serviceIdKind: ServiceIdKind) => boolean;

  setPni: (pni: PniString, keyMaterial?: PniKeyMaterialType) => Promise<void>;

  addEventListener: (eventName: string, callback: EventHandler) => void;
};

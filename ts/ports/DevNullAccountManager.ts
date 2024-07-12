/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ConfirmNumberResultType } from '../textsecure/AccountManager';
import type { KeyPairType, PniKeyMaterialType } from '../textsecure/Types';
import type { ServiceIdKind, PniString } from '../types/ServiceId';
import type { IAccountManager } from './IAccountManager';
import type { EventHandler } from '../textsecure/EventTarget';
import EventTarget from '../textsecure/EventTarget';

export class DevNullAccountManager
  extends EventTarget
  implements IAccountManager
{
  encryptDeviceName = (
    name: string,
    identityKey: KeyPairType
  ): string | undefined => undefined;

  decryptDeviceName = (base64: string): Promise<string> => Promise.resolve('');

  maybeUpdateDeviceName = (): Promise<void> => Promise.resolve();

  deviceNameIsEncrypted = (): Promise<void> => Promise.resolve();

  registerSingleDevice = (
    number: string,
    verificationCode: string,
    sessionId: string
  ): Promise<void> => Promise.resolve();

  registerSecondDevice = (
    setProvisioningUrl: (url: string) => void,
    confirmNumber: (number?: string) => Promise<ConfirmNumberResultType>
  ): Promise<void> => Promise.resolve();

  maybeUpdateKeys = (
    serviceIdKind: ServiceIdKind,
    forceUpdate?: boolean
  ): Promise<void> => Promise.resolve();

  areKeysOutOfDate = (serviceIdKind: ServiceIdKind): boolean => false;
  setPni = (pni: PniString, keyMaterial?: PniKeyMaterialType): Promise<void> =>
    Promise.resolve();

  override addEventListener = (
    eventName: string,
    callback: EventHandler
  ): void => {
    // 'registration' -- see: ts/background.ts
  };
}

/* eslint-disable @typescript-eslint/no-empty-function */
import type { SignalService } from '../protobuf';
import type { IStorageService } from './IStorageService';

export class DevNullStorageService implements IStorageService {
  enableStorageService = (): void => {};
  eraseAllStorageServiceState = (): Promise<void> => Promise.resolve();
  reprocessUnknownFields = (): Promise<void> => Promise.resolve();
  upload = (): Promise<void> => Promise.resolve();
  sync = (): Promise<SignalService.ManifestRecord | undefined> =>
    Promise.resolve(undefined);
}

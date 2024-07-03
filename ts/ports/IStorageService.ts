import type { SignalService as Proto } from '../protobuf';

export type IStorageService = {
  enableStorageService: () => void;
  eraseAllStorageServiceState: (args: {
    keepUnknownFields?: boolean;
  }) => Promise<void>;
  reprocessUnknownFields: () => Promise<void>;
  upload: (fromSync: boolean) => Promise<void>;
  sync: (ignoreConflicts: boolean) => Promise<Proto.ManifestRecord | undefined>;
};

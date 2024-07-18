import type { SignalProtocolStore } from '../SignalProtocolStore';
import type { User } from '../textsecure/storage/User';
import type { StorageAccessType, StorageInterface } from '../types/Storage';

export type IStorage = StorageInterface & {
  user: User;
  protocol: SignalProtocolStore;
  init: () => Promise<void>;
  fetch: () => Promise<void>;
  reset: () => void;
  getItemsState: () => Partial<StorageAccessType>;
};

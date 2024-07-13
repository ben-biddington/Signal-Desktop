/* eslint-disable max-len */
import { SignalProtocolStore } from '../SignalProtocolStore';
import { Blocked } from '../textsecure/storage/Blocked';
import { User } from '../textsecure/storage/User';
import type { PniString } from '../types/ServiceId';
import { generateAci } from '../types/ServiceId';
import type { StorageAccessType } from '../types/Storage';
import { markDone } from '../util/registration';
import type { IStorage } from './IStorage';

export class DevNullStorage implements IStorage {
  private readonly _user: User;
  public readonly blocked: Blocked;
  public initialised: boolean = false;
  public readonly id = generateAci();

  private items: Partial<StorageAccessType> = Object.create(null);

  private privProtocol = new SignalProtocolStore();
  private ready: boolean = false;
  private readyCallbacks: Array<() => void> = [];

  get user(): User {
    return this._user;
  }

  get protocol(): SignalProtocolStore {
    return this.privProtocol;
  }

  set protocol(value: SignalProtocolStore) {
    this.privProtocol = value;
  }

  constructor() {
    this._user = new User(this);
    this.blocked = new Blocked(this);
    // [!] **Not** assigning `window.storage` like `Storage` does (ts/textsecure/Storage.ts)
  }

  public init = async (): Promise<void> => {
    await Promise.all([
      this.user.setCredentials({
        // See: ts/util/registration.ts
        aci: generateAci(),
        pni: 'PNI:dc46c18a-39eb-4251-be05-d00c00e605f2' as PniString,
        number: '',
        deviceId: 0,
        password: '',
      }),
      markDone(),
    ]);

    this.initialised = true;
  };

  public fetch = (): Promise<void> => {
    window.storage = this;
    this.ready = true;
    this.callListeners();
    return Promise.resolve();
  };

  private callListeners(): void {
    if (!this.ready) {
      return;
    }
    const callbacks = this.readyCallbacks;
    this.readyCallbacks = [];
    callbacks.forEach(callback => callback());
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public reset(): void {}

  public getItemsState(): Partial<StorageAccessType> {
    return {};
  }

  //
  // StorageInterface
  //

  public onready(callback: () => void): void {
    if (this.ready) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  // Copied from ts/textsecure/Storage.ts
  public get<K extends keyof StorageAccessType>(
    key: K,
    defaultValue?: StorageAccessType[K]
  ): StorageAccessType[K] | undefined {
    const item = this.items[key];

    return item === undefined ? defaultValue : item;
  }

  // Copied from ts/textsecure/Storage.ts
  public async put<K extends keyof StorageAccessType>(
    key: K,
    value: StorageAccessType[K]
  ): Promise<void> {
    this.items[key] = value;

    await window.Signal.Data.createOrUpdateItem({ id: key, value });

    window.reduxActions?.items.putItemExternal(key, value);
  }

  // Copied from ts/textsecure/Storage.ts
  public async remove<K extends keyof StorageAccessType>(
    key: K
  ): Promise<void> {
    delete this.items[key];
  }
}

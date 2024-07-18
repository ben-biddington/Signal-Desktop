import { SignalProtocolStore } from '../SignalProtocolStore';
import { Blocked } from '../textsecure/storage/Blocked';
import { User } from '../textsecure/storage/User';
import { generateAci, generatePni } from '../types/ServiceId';
import type { StorageAccessType } from '../types/Storage';
import type { IStorage } from './IStorage';

export class DevNullStorage implements IStorage {
  private readonly _user: User;
  public readonly blocked: Blocked;
  public initialised: boolean = false;

  private items: Partial<StorageAccessType> = Object.create(null);

  private privProtocol = new SignalProtocolStore();
  private ready: boolean = false;
  private readyCallbacks: Array<() => void> = [];

  get user(): User {
    if (!this._user.getAci()) {
      // eslint-disable-next-line no-console
      console.log(
        `[DevNullStorage.user] initialised: <${
          this.initialised
        }>, user <aci: ${this._user.getAci()}> getter called by ${
          new Error().stack
        }`
      );
    }
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
    /*
        [!] Forced to do this at the moment due to

        ```ts
          // ts/background.ts
          ourProfileKeyService.initialize(window.storage);
        ```

        The `Storage` ctor assigns window.storage so we'll do the same.  
    */
    window.storage = this;
  }

  public init = async (): Promise<void> => {
    await this.user.setCredentials({
      aci: generateAci(),
      pni: generatePni(),
      number: '',
      deviceId: 0,
      password: '',
    });

    this.initialised = true;

    // eslint-disable-next-line no-console
    console.log('init', this.user.getCheckedAci());
  };

  public fetch = (): Promise<void> => {
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
    // eslint-disable-next-line no-console
    console.log('DevNullStorage.onready', new Error().stack);
    if (this.ready) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  // Same as ts/textsecure/Storage.ts
  public get<K extends keyof StorageAccessType>(
    key: K,
    defaultValue?: StorageAccessType[K]
  ): StorageAccessType[K] | undefined {
    const item = this.items[key];
    if (item === undefined) {
      return defaultValue;
    }

    return item;
  }

  // Same as ts/textsecure/Storage.ts
  public async put<K extends keyof StorageAccessType>(
    key: K,
    value: StorageAccessType[K]
  ): Promise<void> {
    this.items[key] = value;
    await window.Signal.Data.createOrUpdateItem({ id: key, value });

    window.reduxActions?.items.putItemExternal(key, value);
  }

  // Same as ts/textsecure/Storage.ts
  public async remove<K extends keyof StorageAccessType>(
    key: K
  ): Promise<void> {
    delete this.items[key];
  }
}

import { throttle } from 'lodash';
import type { ConfigKeyType } from '../RemoteConfig';
import type { WebAPIType } from '../textsecure/WebAPI';
import type { LoggerType } from '../types/Logging';
import { DevNullLog } from './DevNullLog';
import type { RemoteConfig } from './remote-config';

export class DevNullRemoteConfig implements RemoteConfig {
  private logger: LoggerType;

  constructor(logger: LoggerType = new DevNullLog()) {
    this.logger = logger;
    window.console.log('[DevNullInitializeGroupCredentialFetcher] ctor');
  }

  onChange =
    (
      key: ConfigKeyType,
      fn: (value: {
        name: ConfigKeyType;
        enabled: boolean;
        enabledAt?: number;
        value?: string;
      }) => unknown
    ) =>
    () => {};

  isEnabled = () => false;
  getValue = () => undefined;
  isBucketValueEnabled = () => false;
  innerIsBucketValueEnabled = () => false;
  getCountryCodeValue = () => undefined;
  getBucketValue = () => 0;
  refreshRemoteConfig = (server: WebAPIType) => {
    console.log(
      `[DevNullInitializeGroupCredentialFetcher] Not fetching remote config from <${server}>`
    );
    return Promise.resolve();
  };

  // ts/RemoteConfig.ts
  maybeRefreshRemoteConfig = throttle(
    this.refreshRemoteConfig,
    2 * 60 * 60 * 1000,
    { trailing: false }
  );

  initRemoteConfig = (): Promise<void> => {
    return Promise.resolve();
  };
}

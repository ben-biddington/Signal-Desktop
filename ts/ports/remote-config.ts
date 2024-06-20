import type { Cancelable } from 'lodash';
import type { ConfigKeyType } from '../RemoteConfig';
import type { WebAPIType } from '../textsecure/WebAPI';
import type { AciString } from '../types/ServiceId';

type ConfigValueType = {
  name: ConfigKeyType;
  enabled: boolean;
  enabledAt?: number;
  value?: string;
};
type ConfigListenerType = (value: ConfigValueType) => unknown;

export type RemoteConfig = {
  initRemoteConfig: (server: WebAPIType) => Promise<void>;
  onChange: (key: ConfigKeyType, fn: ConfigListenerType) => () => void;
  isEnabled: (name: ConfigKeyType) => boolean;
  getValue: (name: ConfigKeyType) => string | undefined;
  isBucketValueEnabled: (
    name: ConfigKeyType,
    e164: string | undefined,
    aci: AciString | undefined
  ) => boolean;
  innerIsBucketValueEnabled: (
    name: ConfigKeyType,
    flagValue: unknown,
    e164: string | undefined,
    aci: AciString | undefined
  ) => boolean;
  getCountryCodeValue: (
    countryCode: number,
    flagValue: string,
    flagName: string
  ) => number | undefined;
  getBucketValue: (aci: AciString, flagName: string) => number;
  refreshRemoteConfig: (server: WebAPIType) => Promise<void>;
  maybeRefreshRemoteConfig: ((server: WebAPIType) => Promise<void>) &
    Cancelable;
};

import type { ClientInterface } from '../sql/Interface';
import { DevNullRemoteConfig } from './DevNullRemoteConfig';
import { DevNullInitializeGroupCredentialFetcher } from './DevNullInitializeGroupCredentialFetcher';
import type { RemoteConfig } from './remote-config';
import type { TextSecureType } from '../textsecure';
import { create } from './DevNullTextSecure';

export type InitializeGroupCredentialFetcher = () => Promise<void>;

export type Ports = {
  initializeGroupCredentialFetcher: InitializeGroupCredentialFetcher;
  remoteConfig: RemoteConfig;
  data?: ClientInterface;
  textsecure?: TextSecureType;
};

export class PortsBuilder {
  private value: Ports = devNull();

  public build(): Ports {
    return this.value;
  }

  public with(value: Partial<Ports>): PortsBuilder {
    this.value = { ...this.value, ...value };
    return this;
  }
}

export const newPorts = (): PortsBuilder => new PortsBuilder();

const isPortsBuilder = (value: Ports | PortsBuilder): value is PortsBuilder => {
  return (value as PortsBuilder)?.build !== undefined;
};

export const asPorts = (value: Ports | PortsBuilder): Ports => {
  return isPortsBuilder(value) ? value.build() : value;
};

export const devNull: () => Ports = () => ({
  initializeGroupCredentialFetcher: DevNullInitializeGroupCredentialFetcher,
  remoteConfig: new DevNullRemoteConfig(),
  textsecure: create(),
});

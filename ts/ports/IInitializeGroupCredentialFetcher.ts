export type IInitializeGroupCredentialFetcher = () => Promise<void>;

export const DevNullInitializeGroupCredentialFetcher = (): Promise<void> =>
  Promise.resolve();

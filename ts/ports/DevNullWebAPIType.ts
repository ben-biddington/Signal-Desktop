/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Response } from 'node-fetch';
import { Readable } from 'stream';
import { AuthCredentialWithPni } from '@signalapp/libsignal-client/zkgroup';
import type {
  LinkPreviewMetadata,
  LinkPreviewImage,
} from '../linkPreviews/linkPreviewFetch';
import type { SignalService } from '../protobuf';
import type { CDSResponseType } from '../textsecure/cds/Types';
import type {
  IRequestHandler,
  StorageServiceCredentials,
  StorageServiceCallOptionsType,
  WebAPICredentials,
} from '../textsecure/Types';
import type {
  AttachmentV3ResponseType,
  BackupDeleteMediaOptionsType,
  BackupListMediaOptionsType,
  BackupListMediaResponseType,
  BackupMediaBatchOptionsType,
  BackupMediaBatchResponseType,
  CallLinkCreateAuthResponseType,
  CapabilitiesUploadType,
  CdsLookupOptionsType,
  ChallengeType,
  ConfirmUsernameOptionsType,
  ConfirmUsernameResultType,
  CreateAccountOptionsType,
  CreateAccountResultType,
  GetAccountForUsernameOptionsType,
  GetAccountForUsernameResultType,
  GetBackupCDNCredentialsOptionsType,
  GetBackupCDNCredentialsResponseType,
  GetBackupCredentialsOptionsType,
  GetBackupCredentialsResponseType,
  GetBackupInfoResponseType,
  GetGroupCredentialsOptionsType,
  GetGroupCredentialsResultType,
  GetGroupLogOptionsType,
  GetIceServersResultType,
  GetProfileOptionsType,
  GetProfileUnauthOptionsType,
  GetSenderCertificateResultType,
  GroupCredentialsType,
  GroupLogResponseType,
  HeaderListType,
  LinkDeviceOptionsType,
  LinkDeviceResultType,
  MakeProxiedRequestResultType,
  MessageType,
  MultiRecipient200ResponseType,
  ProfileRequestDataType,
  ProfileType,
  ProxiedRequestOptionsType,
  RemoteConfigResponseType,
  ReplaceUsernameLinkOptionsType,
  ReplaceUsernameLinkResultType,
  ReportMessageOptionsType,
  RequestVerificationResultType,
  ReserveUsernameOptionsType,
  ReserveUsernameResultType,
  ResolveUsernameLinkResultType,
  ServerKeyCountType,
  ServerKeysType,
  SetBackupIdOptionsType,
  SetBackupSignatureKeyOptionsType,
  UploadAvatarHeadersType,
  UploadKeysType,
  VerifyServiceIdRequestType,
  VerifyServiceIdResponseType,
  WebAPIConnectOptionsType,
  WebAPIConnectType,
  WebAPIType,
  WhoamiResultType,
} from '../textsecure/WebAPI';
import type { IWebSocketResource } from '../textsecure/WebsocketResources';
import type { BackupPresentationHeadersType } from '../types/backups';
import type { PniString } from '../types/ServiceId';
import {
  type ServiceIdString,
  type ServiceIdKind,
  type UntaggedPniString,
  toUntaggedPni,
} from '../types/ServiceId';
import { SocketStatus } from '../types/SocketStatus';
import type { VerificationTransport } from '../types/VerificationTransport';
import type { FetchFunctionType } from '../util/uploads/tusProtocol';
import { toDayMillis } from '../util/timestamp';
import * as Curve from '../Curve';
import { generateKeyPair } from '../Curve';
import { fromString, toBase64 } from '../Bytes';

const resolve = <T>(result: T) => Promise.resolve(result);
const resolveEmpty = () => Promise.resolve(new Uint8Array(0));

export type Options = {
  pni: string;
};

export class DevNullWebAPIType implements WebAPIType, WebAPIConnectType {
  constructor(private readonly opts: Options) {}

  connect = (options: WebAPIConnectOptionsType): WebAPIType => {
    this.info('connect', options);
    return new DevNullWebAPIType({ pni: 'PNI:UNKNOWN' });
  };

  startRegistration = (): void => {};
  finishRegistration = (): void => {};
  cancelInflightRequests = (): void => {};
  cdsLookup = (options: CdsLookupOptionsType): Promise<CDSResponseType> =>
    Promise.resolve({} as CDSResponseType);

  createAccount = (
    options: CreateAccountOptionsType
  ): Promise<CreateAccountResultType> =>
    Promise.resolve({} as CreateAccountResultType);

  createGroup = (
    group: SignalService.IGroup,
    options: GroupCredentialsType
  ): Promise<SignalService.IGroupResponse> =>
    Promise.resolve({} as SignalService.IGroupResponse);

  deleteUsername = (abortSignal?: AbortSignal): Promise<void> =>
    Promise.resolve();

  downloadOnboardingStories = (
    version: string,
    imageFiles: Array<string>
  ): Promise<Array<Uint8Array>> => Promise.resolve([]);

  getAttachmentFromBackupTier = (args: {
    mediaId: string;
    backupDir: string;
    mediaDir: string;
    cdnNumber: number;
    headers: Record<string, string>;
    options?: { disableRetries?: boolean; timeout?: number };
  }): Promise<Readable> => Promise.resolve(new Readable());

  getAttachment = (args: {
    cdnKey: string;
    cdnNumber?: number;
    options?: { disableRetries?: boolean; timeout?: number };
  }): Promise<Readable> => Promise.resolve(new Readable());

  getAttachmentUploadForm = (): Promise<AttachmentV3ResponseType> =>
    Promise.resolve({} as AttachmentV3ResponseType);

  getAvatar = (path: string): Promise<Uint8Array> =>
    Promise.resolve(new Uint8Array(0));

  getHasSubscription = (subscriberId: Uint8Array): Promise<boolean> =>
    Promise.resolve(false);

  getGroup = (
    options: GroupCredentialsType
  ): Promise<SignalService.IGroupResponse> =>
    Promise.resolve({} as SignalService.IGroupResponse);

  getGroupFromLink = (
    inviteLinkPassword: string | undefined,
    auth: GroupCredentialsType
  ): Promise<SignalService.GroupJoinInfo> =>
    resolve({} as SignalService.GroupJoinInfo);

  getGroupAvatar = (key: string): Promise<Uint8Array> =>
    resolve(new Uint8Array(0));

  getGroupCredentials = (
    options: GetGroupCredentialsOptionsType
    /*
      {
        startDayInMs: number;
        endDayInMs: number;
      }
     */
  ): Promise<GetGroupCredentialsResultType> => {
    console.log('getGroupCredentials', { opts: this.opts });

    // const authCredential = new AuthCredentialWithPni(
    //   Buffer.from(authCredentialBase64, 'base64')
    // );

    const authCredential = new AuthCredentialWithPni(
      Buffer.from(this.opts.pni, 'ascii')
    );

    const value: GetGroupCredentialsResultType = {
      pni: toUntaggedPni(this.opts.pni as PniString),
      callLinkAuthCredentials: [
        {
          credential: toBase64(authCredential.contents),
          redemptionTime: toDayMillis(Date.now()),
        },
      ],
      credentials: [
        {
          credential: toBase64(authCredential.contents),
          redemptionTime: toDayMillis(Date.now()),
        },
      ],
    };

    this.info('getGroupCredentials', { value });

    return resolve(value);
  };

  getExternalGroupCredential = (
    options: GroupCredentialsType
  ): Promise<SignalService.IExternalGroupCredential> =>
    resolve({} as SignalService.IExternalGroupCredential);

  getGroupLog = (
    options: GetGroupLogOptionsType,
    credentials: GroupCredentialsType
  ): Promise<GroupLogResponseType> => resolve({} as GroupLogResponseType);

  getIceServers = (): Promise<GetIceServersResultType> =>
    resolve({} as GetIceServersResultType);

  getKeysForServiceId = (
    serviceId: ServiceIdString,
    deviceId?: number
  ): Promise<ServerKeysType> => {
    const keyId = 1;
    const identityKey = generateKeyPair();
    const signedPreKey = Curve.generateSignedPreKey(identityKey, keyId);

    return resolve({
      devices: [
        {
          deviceId: deviceId || 1,
          registrationId: 1,
          signedPreKey: {
            keyId: signedPreKey.keyId,
            publicKey: signedPreKey.keyPair.pubKey,
            signature: signedPreKey.signature,
          },
        },
      ],
      identityKey: identityKey.pubKey,
    });
  };

  getKeysForServiceIdUnauth = (
    serviceId: ServiceIdString,
    deviceId?: number,
    options?: { accessKey?: string }
  ): Promise<ServerKeysType> => this.getKeysForServiceId(serviceId, deviceId);

  getMyKeyCounts = (
    serviceIdKind: ServiceIdKind
  ): Promise<ServerKeyCountType> => resolve({} as ServerKeyCountType);

  getOnboardingStoryManifest = (): Promise<{
    version: string;
    languages: Record<string, Array<string>>;
  }> => resolve({ version: '', languages: {} });

  getProfile = (
    serviceId: ServiceIdString,
    options: GetProfileOptionsType
  ): Promise<ProfileType> => resolve({} as ProfileType);

  getAccountForUsername = (
    options: GetAccountForUsernameOptionsType
  ): Promise<GetAccountForUsernameResultType> =>
    resolve({} as GetAccountForUsernameResultType);

  getProfileUnauth = (
    serviceId: ServiceIdString,
    options: GetProfileUnauthOptionsType
  ): Promise<ProfileType> => resolve({} as ProfileType);

  getBadgeImageFile = (imageUrl: string): Promise<Uint8Array> =>
    resolve(new Uint8Array(0));

  getSubscriptionConfiguration = (
    userLanguages: ReadonlyArray<string>
  ): Promise<unknown> => Promise.resolve();

  getProvisioningResource = (
    handler: IRequestHandler
  ): Promise<IWebSocketResource> => resolve({} as IWebSocketResource);

  // Required by `requestSenderCertificate`
  getSenderCertificate = (
    withUuid?: boolean
  ): Promise<GetSenderCertificateResultType> => {
    const result: GetSenderCertificateResultType = {
      certificate: '',
    };

    return Promise.resolve(result);
  };

  getSticker = (packId: string, stickerId: number): Promise<Uint8Array> =>
    resolveEmpty();

  getStickerPackManifest = (packId: string): Promise<Uint8Array> =>
    resolveEmpty();

  getStorageCredentials = (): Promise<StorageServiceCredentials> =>
    resolve({} as StorageServiceCredentials);

  getStorageManifest = (
    options: Readonly<StorageServiceCallOptionsType>
  ): Promise<Uint8Array> => resolveEmpty();

  getStorageRecords = (
    data: Readonly<Uint8Array>,
    options: Readonly<StorageServiceCallOptionsType>
  ): Promise<Uint8Array> => resolveEmpty();

  fetchLinkPreviewMetadata = (
    href: string,
    abortSignal: AbortSignal
  ): Promise<null | LinkPreviewMetadata> => resolve(null);

  fetchLinkPreviewImage = (
    href: string,
    abortSignal: AbortSignal
  ): Promise<null | LinkPreviewImage> => resolve(null);

  linkDevice = (
    options: LinkDeviceOptionsType
  ): Promise<LinkDeviceResultType> => resolve({} as LinkDeviceResultType);

  makeProxiedRequest = (
    targetUrl: string,
    options?: ProxiedRequestOptionsType
  ): Promise<MakeProxiedRequestResultType> =>
    resolve({} as MakeProxiedRequestResultType);

  makeSfuRequest = (
    targetUrl: string,
    type: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD',
    headers: HeaderListType,
    body: Uint8Array | undefined
  ): Promise<{
    data: Uint8Array;
    contentType: string | null;
    response: Response;
  }> =>
    resolve({
      data: new Uint8Array(0),
      contentType: null,
      response: new Response(),
    });

  modifyGroup = (
    changes: SignalService.GroupChange.IActions,
    options: GroupCredentialsType,
    inviteLinkBase64?: string
  ): Promise<SignalService.IGroupChangeResponse> =>
    resolve({} as SignalService.IGroupChangeResponse);

  modifyStorageRecords = (
    data: Readonly<Uint8Array>,
    options: Readonly<StorageServiceCallOptionsType>
  ): Promise<Uint8Array> => resolveEmpty();

  postBatchIdentityCheck = (
    elements: VerifyServiceIdRequestType
  ): Promise<VerifyServiceIdResponseType> =>
    resolve({} as VerifyServiceIdResponseType);

  putEncryptedAttachment = (
    encryptedBin: Uint8Array | Readable,
    uploadForm: AttachmentV3ResponseType
  ): Promise<void> => Promise.resolve();

  putProfile = (
    jsonData: ProfileRequestDataType
  ): Promise<UploadAvatarHeadersType | undefined> => resolve(undefined);

  putStickers = (
    encryptedManifest: Uint8Array,
    encryptedStickers: ReadonlyArray<Uint8Array>,
    onProgress?: () => void
  ): Promise<string> => resolve('');

  reserveUsername = (
    options: ReserveUsernameOptionsType
  ): Promise<ReserveUsernameResultType> =>
    resolve({} as ReserveUsernameResultType);

  confirmUsername = (
    options: ConfirmUsernameOptionsType
  ): Promise<ConfirmUsernameResultType> =>
    resolve({} as ConfirmUsernameResultType);

  replaceUsernameLink = (
    options: ReplaceUsernameLinkOptionsType
  ): Promise<ReplaceUsernameLinkResultType> =>
    resolve({} as ReplaceUsernameLinkResultType);

  deleteUsernameLink = (): Promise<void> => Promise.resolve();
  resolveUsernameLink = (
    serverId: string
  ): Promise<ResolveUsernameLinkResultType> =>
    resolve({} as ResolveUsernameLinkResultType);

  registerCapabilities = (
    capabilities: CapabilitiesUploadType
  ): Promise<void> => Promise.resolve();

  registerKeys = (
    genKeys: UploadKeysType,
    serviceIdKind: ServiceIdKind
  ): Promise<void> => Promise.resolve();

  registerSupportForUnauthenticatedDelivery = (): Promise<void> =>
    Promise.resolve();
  reportMessage = (options: ReportMessageOptionsType): Promise<void> =>
    Promise.resolve();
  requestVerification = (
    number: string,
    captcha: string,
    transport: VerificationTransport
  ): Promise<RequestVerificationResultType> =>
    resolve({} as RequestVerificationResultType);

  checkAccountExistence = (serviceId: ServiceIdString): Promise<boolean> =>
    resolve(false);

  sendMessages = (
    destination: ServiceIdString,
    messageArray: ReadonlyArray<MessageType>,
    timestamp: number,
    options: { online?: boolean; story?: boolean; urgent?: boolean }
  ): Promise<void> => Promise.resolve();

  sendMessagesUnauth = (
    destination: ServiceIdString,
    messageArray: ReadonlyArray<MessageType>,
    timestamp: number,
    options: {
      accessKey?: string;
      online?: boolean;
      story?: boolean;
      urgent?: boolean;
    }
  ): Promise<void> => Promise.resolve();

  sendWithSenderKey = (
    payload: Uint8Array,
    accessKeys: Uint8Array,
    timestamp: number,
    options: { online?: boolean; story?: boolean; urgent?: boolean }
  ): Promise<MultiRecipient200ResponseType> =>
    resolve({} as MultiRecipient200ResponseType);

  createFetchForAttachmentUpload =
    (attachment: AttachmentV3ResponseType): FetchFunctionType =>
    () =>
      resolve(new Response());

  getBackupInfo = (
    headers: BackupPresentationHeadersType
  ): Promise<GetBackupInfoResponseType> =>
    resolve({} as GetBackupInfoResponseType);

  getBackupUploadForm = (
    headers: BackupPresentationHeadersType
  ): Promise<AttachmentV3ResponseType> =>
    resolve({} as AttachmentV3ResponseType);

  getBackupMediaUploadForm = (
    headers: BackupPresentationHeadersType
  ): Promise<AttachmentV3ResponseType> =>
    resolve({} as AttachmentV3ResponseType);

  refreshBackup = (headers: BackupPresentationHeadersType): Promise<void> =>
    Promise.resolve();

  getBackupCredentials = (
    options: GetBackupCredentialsOptionsType
  ): Promise<GetBackupCredentialsResponseType> =>
    resolve({} as GetBackupCredentialsResponseType);

  getBackupCDNCredentials = (
    options: GetBackupCDNCredentialsOptionsType
  ): Promise<GetBackupCDNCredentialsResponseType> =>
    resolve({} as GetBackupCDNCredentialsResponseType);

  setBackupId = (options: SetBackupIdOptionsType): Promise<void> =>
    Promise.resolve();

  setBackupSignatureKey = (
    options: SetBackupSignatureKeyOptionsType
  ): Promise<void> => Promise.resolve();

  backupMediaBatch = (
    options: BackupMediaBatchOptionsType
  ): Promise<BackupMediaBatchResponseType> =>
    resolve({} as BackupMediaBatchResponseType);

  backupListMedia = (
    options: BackupListMediaOptionsType
  ): Promise<BackupListMediaResponseType> =>
    resolve({} as BackupListMediaResponseType);

  backupDeleteMedia = (options: BackupDeleteMediaOptionsType): Promise<void> =>
    Promise.resolve();

  callLinkCreateAuth = (
    requestBase64: string
  ): Promise<CallLinkCreateAuthResponseType> =>
    resolve({} as CallLinkCreateAuthResponseType);

  setPhoneNumberDiscoverability = (newValue: boolean): Promise<void> =>
    Promise.resolve();

  updateDeviceName = (deviceName: string): Promise<void> => Promise.resolve();

  uploadAvatar = (
    uploadAvatarRequestHeaders: UploadAvatarHeadersType,
    avatarData: Uint8Array
  ): Promise<string> => Promise.resolve('');

  uploadGroupAvatar = (
    avatarData: Uint8Array,
    options: GroupCredentialsType
  ): Promise<string> => Promise.resolve('');

  whoami = (): Promise<WhoamiResultType> => resolve({} as WhoamiResultType);

  sendChallengeResponse = (challengeResponse: ChallengeType): Promise<void> =>
    Promise.resolve();

  getConfig = (): Promise<RemoteConfigResponseType> => {
    this.info('[getConfig]');

    const value: RemoteConfigResponseType = {
      config: [
        {
          name: 'test',
          enabled: true,
        },
      ],
      serverEpochTime: new Date().getTime(),
    };

    return resolve(value);
  };

  authenticate = (credentials: WebAPICredentials): Promise<void> => {
    this.info('authenticate', credentials);
    return Promise.resolve();
  };

  logout = (): Promise<void> => Promise.resolve();

  getSocketStatus = (): SocketStatus => SocketStatus.OPEN;

  registerRequestHandler = (handler: IRequestHandler): void => {
    this.info('registerRequestHandler', handler);
  };

  unregisterRequestHandler = (handler: IRequestHandler): void => {};

  onHasStoriesDisabledChange = (newValue: boolean): void => {};

  checkSockets = (): void => {};

  isOnline = (): boolean | undefined => true;

  onNavigatorOnline = (): Promise<void> => Promise.resolve();
  onNavigatorOffline = (): Promise<void> => Promise.resolve();
  onRemoteExpiration = (): Promise<void> => Promise.resolve();
  reconnect = (): Promise<void> => Promise.resolve();

  private info = (...messages: Array<unknown>) =>
    console.log(
      '[DevNullWebAPIType]',
      ...messages,
      new Error('not an error').stack
    );
}

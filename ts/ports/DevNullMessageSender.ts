/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PlaintextContent } from '@signalapp/libsignal-client';
import type {
  LinkPreviewMetadata,
  LinkPreviewImage,
} from '../linkPreviews/linkPreviewFetch';
import type { SignalService } from '../protobuf';
import type { SendLogCallbackType } from '../textsecure/OutgoingMessage';
import type {
  OutgoingTextAttachmentType,
  MessageOptionsType,
  GroupV2InfoType,
  Message,
  GroupSendOptionsType,
  SendOptionsType,
  OutgoingLinkPreviewType,
  OutgoingQuoteType,
  ReactionType,
  OutgoingStickerType,
} from '../textsecure/SendMessage';
import type {
  CallbackResultType,
  StorageServiceCredentials,
  StorageServiceCallOptionsType,
} from '../textsecure/Types';
import type {
  GetProfileOptionsType,
  GetProfileUnauthOptionsType,
  WebAPIType,
  GroupCredentialsType,
  GetGroupLogOptionsType,
  GroupLogResponseType,
  ProxiedRequestOptionsType,
  ChallengeType,
  StickerPackManifestType,
  MakeProxiedRequestResultType,
} from '../textsecure/WebAPI';
import type { UploadedAttachmentType } from '../types/Attachment';
import type { RawBodyRange } from '../types/BodyRange';
import type { EmbeddedContactWithUploadedAvatar } from '../types/EmbeddedContact';
import type { ServiceIdString, AciString } from '../types/ServiceId';
import type { StoryContextType } from '../types/Util';
import type { DurationInSeconds } from '../util/durations';
import type { SendTypesType } from '../util/handleMessageSend';
import type { IMessageSender } from './IMessageSender';
import { DevNullWebAPIType } from './DevNullWebAPIType';

export class DevNullMessageSender implements IMessageSender {
  readonly server: WebAPIType = new DevNullWebAPIType({ pni: '' });
  private resolve = <T>(result: T) => Promise.resolve(result);
  private emptyUint8Array = <T>() => Promise.resolve({} as T);
  private emptyArray = () => this.resolve(new Uint8Array(0));

  constructor() {
    console.log('[DevNullMessageSender] ctor');
  }

  queueJobForServiceId = <T>(
    serviceId: ServiceIdString,
    runJob: () => Promise<T>
  ): Promise<T> => {
    return runJob();
  };

  getTextAttachmentProto = (
    attachmentAttrs: OutgoingTextAttachmentType
  ): SignalService.TextAttachment => {
    return {} as SignalService.TextAttachment;
  };

  getDataOrEditMessage = (
    options: Readonly<MessageOptionsType>
  ): Promise<Uint8Array> => this.emptyArray();

  getStoryMessage = (options: {
    allowsReplies?: boolean;
    bodyRanges?: Array<RawBodyRange>;
    fileAttachment?: UploadedAttachmentType;
    groupV2?: GroupV2InfoType;
    profileKey: Uint8Array;
    textAttachment?: OutgoingTextAttachmentType;
  }): Promise<SignalService.StoryMessage> =>
    this.resolve({} as SignalService.StoryMessage);

  getContentMessage = (
    options: Readonly<MessageOptionsType> &
      Readonly<{ includePniSignatureMessage?: boolean }>
  ): Promise<SignalService.Content> =>
    this.resolve({} as SignalService.Content);

  getHydratedMessage = (
    attributes: Readonly<MessageOptionsType>
  ): Promise<Message> => this.resolve({} as Message);

  getTypingContentMessage = (
    options: Readonly<{
      recipientId?: ServiceIdString;
      groupId?: Uint8Array;
      groupMembers: ReadonlyArray<ServiceIdString>;
      isTyping: boolean;
      timestamp?: number;
    }>
  ): SignalService.Content => ({} as SignalService.Content);

  getAttrsFromGroupOptions = (
    options: Readonly<GroupSendOptionsType>
  ): MessageOptionsType => ({} as MessageOptionsType);

  sendMessage = (
    options: Readonly<{
      messageOptions: MessageOptionsType;
      contentHint: number;
      groupId: string | undefined;
      options?: SendOptionsType;
      urgent: boolean;
      story?: boolean;
      includePniSignatureMessage?: boolean;
    }>
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  sendMessageProto = (
    options: Readonly<{
      callback: (result: CallbackResultType) => void;
      contentHint: number;
      groupId: string | undefined;
      options?: SendOptionsType;
      proto:
        | SignalService.Content
        | SignalService.DataMessage
        | PlaintextContent;
      recipients: ReadonlyArray<ServiceIdString>;
      sendLogCallback?: SendLogCallbackType;
      story?: boolean;
      timestamp: number;
      urgent: boolean;
    }>
  ): Promise<void> => Promise.resolve();

  sendMessageProtoAndWait = (
    options: Readonly<{
      timestamp: number;
      recipients: Array<ServiceIdString>;
      proto:
        | SignalService.Content
        | SignalService.DataMessage
        | PlaintextContent;
      contentHint: number;
      groupId: string | undefined;
      options?: SendOptionsType;
      urgent: boolean;
      story?: boolean;
    }>
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  sendIndividualProto = (
    options: Readonly<{
      contentHint: number;
      groupId?: string;
      serviceId: ServiceIdString | undefined;
      options?: SendOptionsType;
      proto:
        | SignalService.DataMessage
        | SignalService.Content
        | PlaintextContent;
      timestamp: number;
      urgent: boolean;
    }>
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  sendMessageToServiceId = (
    options: Readonly<{
      attachments: ReadonlyArray<UploadedAttachmentType> | undefined;
      bodyRanges?: ReadonlyArray<RawBodyRange>;
      contact?: ReadonlyArray<EmbeddedContactWithUploadedAvatar>;
      contentHint: number;
      deletedForEveryoneTimestamp: number | undefined;
      expireTimer: DurationInSeconds | undefined;
      groupId: string | undefined;
      serviceId: ServiceIdString;
      messageText: string | undefined;
      options?: SendOptionsType;
      preview?: ReadonlyArray<OutgoingLinkPreviewType> | undefined;
      profileKey?: Uint8Array;
      quote?: OutgoingQuoteType;
      reaction?: ReactionType;
      sticker?: OutgoingStickerType;
      storyContext?: StoryContextType;
      story?: boolean;
      targetTimestampForEdit?: number;
      timestamp: number;
      urgent: boolean;
      includePniSignatureMessage?: boolean;
    }>
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  sendSyncMessage = (
    options: Readonly<{
      encodedDataMessage?: Uint8Array;
      encodedEditMessage?: Uint8Array;
      timestamp: number;
      destination: string | undefined;
      destinationServiceId: ServiceIdString | undefined;
      expirationStartTimestamp: number | null;
      conversationIdsSentTo?: Iterable<string>;
      conversationIdsWithSealedSender?: Set<string>;
      isUpdate?: boolean;
      urgent: boolean;
      options?: SendOptionsType;
      storyMessage?: SignalService.StoryMessage;
      storyMessageRecipients?: ReadonlyArray<SignalService.SyncMessage.Sent.IStoryMessageRecipient>;
    }>
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  syncReadMessages = (
    reads: ReadonlyArray<{
      senderAci?: AciString;
      senderE164?: string;
      timestamp: number;
    }>,
    options?: Readonly<SendOptionsType>
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  syncView = (
    views: ReadonlyArray<{
      senderAci?: AciString;
      senderE164?: string;
      timestamp: number;
    }>,
    options?: SendOptionsType
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  syncViewOnceOpen = (
    viewOnceOpens: ReadonlyArray<{
      senderAci?: AciString;
      senderE164?: string;
      timestamp: number;
    }>,
    options?: Readonly<SendOptionsType>
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  sendCallingMessage = (
    serviceId: ServiceIdString,
    callingMessage: Readonly<SignalService.ICallingMessage>,
    timestamp: number,
    urgent: boolean,
    options?: Readonly<SendOptionsType>
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  sendDeliveryReceipt = (
    options: Readonly<{
      senderAci: AciString;
      timestamps: Array<number>;
      isDirectConversation: boolean;
      options?: Readonly<SendOptionsType>;
    }>
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  sendReadReceipt = (
    options: Readonly<{
      senderAci: AciString;
      timestamps: Array<number>;
      isDirectConversation: boolean;
      options?: Readonly<SendOptionsType>;
    }>
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  sendViewedReceipt = (
    options: Readonly<{
      senderAci: AciString;
      timestamps: Array<number>;
      isDirectConversation: boolean;
      options?: Readonly<SendOptionsType>;
    }>
  ): Promise<CallbackResultType> => this.resolve({} as CallbackResultType);

  makeSendLogCallback = (
    options: Readonly<{
      contentHint: number;
      messageId?: string;
      proto: Buffer;
      sendType: SendTypesType;
      timestamp: number;
      urgent: boolean;
      hasPniSignatureMessage: boolean;
    }>
  ): SendLogCallbackType => ({} as SendLogCallbackType);

  sendGroupProto = (
    options: Readonly<{
      contentHint: number;
      groupId: string | undefined;
      options?: SendOptionsType;
      proto: SignalService.Content;
      recipients: ReadonlyArray<ServiceIdString>;
      sendLogCallback?: SendLogCallbackType;
      story?: boolean;
      timestamp: number;
      urgent: boolean;
    }>
  ): Promise<CallbackResultType> => {
    console.log('[DevNullMessageSender] sendGroupProto', { options });
    return this.resolve({
      successfulServiceIds: [],
      failoverServiceIds: [],
      errors: [],
      unidentifiedDeliveries: [],
      dataMessage: undefined,
      editMessage: undefined,
      contentHint: 0,
      contentProto: new Uint8Array(0),
    });
  };

  getSenderKeyDistributionMessage = (): Promise<SignalService.Content> =>
    this.resolve({} as SignalService.Content);

  sendSenderKeyDistributionMessage = (
    args: Readonly<{
      contentHint?: number;
      distributionId: string;
      groupId: string | undefined;
      serviceIds: ReadonlyArray<ServiceIdString>;
      throwIfNotInDatabase?: boolean;
      story?: boolean;
      urgent: boolean;
    }>,
    options?: Readonly<SendOptionsType>
  ): Promise<CallbackResultType> => this.emptyUint8Array();

  getProfile = (
    serviceId: ServiceIdString,
    options: GetProfileOptionsType | GetProfileUnauthOptionsType
  ): ReturnType<WebAPIType['getProfile']> =>
    ({} as ReturnType<WebAPIType['getProfile']>);

  getAvatar = (path: string): Promise<Uint8Array> =>
    Promise.resolve(new Uint8Array(0));

  getSticker = (packId: string, stickerId: number): Promise<Uint8Array> =>
    this.emptyArray();

  getStickerPackManifest = (packId: string): Promise<StickerPackManifestType> =>
    this.emptyArray();

  createGroup = (
    group: Readonly<SignalService.IGroup>,
    options: Readonly<GroupCredentialsType>
  ): Promise<SignalService.IGroupResponse> =>
    this.resolve({} as SignalService.IGroupResponse);

  uploadGroupAvatar = (
    avatar: Readonly<Uint8Array>,
    options: Readonly<GroupCredentialsType>
  ): Promise<string> => this.resolve('mocked uploadGroupAvatar response');

  getGroup = (
    options: Readonly<GroupCredentialsType>
  ): Promise<SignalService.IGroupResponse> =>
    this.resolve({} as SignalService.IGroupResponse);

  getGroupFromLink = (
    groupInviteLink: string | undefined,
    auth: Readonly<GroupCredentialsType>
  ): Promise<SignalService.GroupJoinInfo> =>
    this.resolve({} as SignalService.GroupJoinInfo);

  getGroupLog = (
    options: GetGroupLogOptionsType,
    credentials: GroupCredentialsType
  ): Promise<GroupLogResponseType> => this.resolve({} as GroupLogResponseType);

  getGroupAvatar = (key: string): Promise<Uint8Array> => this.emptyArray();

  modifyGroup = (
    changes: Readonly<SignalService.GroupChange.IActions>,
    options: Readonly<GroupCredentialsType>,
    inviteLinkBase64?: string
  ): Promise<SignalService.IGroupChangeResponse> =>
    this.resolve({} as SignalService.IGroupChangeResponse);

  fetchLinkPreviewMetadata = (
    href: string,
    abortSignal: AbortSignal
  ): Promise<null | LinkPreviewMetadata> =>
    this.resolve({} as LinkPreviewMetadata);

  fetchLinkPreviewImage = (
    href: string,
    abortSignal: AbortSignal
  ): Promise<null | LinkPreviewImage> => this.resolve(null);

  makeProxiedRequest = (
    url: string,
    options?: Readonly<ProxiedRequestOptionsType>
  ): Promise<MakeProxiedRequestResultType> =>
    this.resolve({} as MakeProxiedRequestResultType);

  getStorageCredentials = (): Promise<StorageServiceCredentials> =>
    this.resolve({} as StorageServiceCredentials);

  getStorageManifest = (
    options: Readonly<StorageServiceCallOptionsType>
  ): Promise<Uint8Array> => this.emptyUint8Array();

  getStorageRecords = (
    data: Readonly<Uint8Array>,
    options: Readonly<StorageServiceCallOptionsType>
  ): Promise<Uint8Array> => this.emptyUint8Array();

  modifyStorageRecords = (
    data: Readonly<Uint8Array>,
    options: Readonly<StorageServiceCallOptionsType>
  ): Promise<Uint8Array> => this.emptyUint8Array();

  getGroupMembershipToken = (
    options: Readonly<GroupCredentialsType>
  ): Promise<SignalService.IExternalGroupCredential> =>
    this.resolve({} as SignalService.IExternalGroupCredential);

  sendChallengeResponse = (
    challengeResponse: Readonly<ChallengeType>
  ): Promise<void> => Promise.resolve();
}

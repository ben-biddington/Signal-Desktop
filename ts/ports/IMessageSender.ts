import type { PlaintextContent } from '@signalapp/libsignal-client';
import type {
  GroupSendOptionsType,
  GroupV2InfoType,
  Message,
  MessageOptionsType,
  OutgoingLinkPreviewType,
  OutgoingQuoteType,
  OutgoingStickerType,
  OutgoingTextAttachmentType,
  ReactionType,
  SendOptionsType,
} from '../textsecure/SendMessage';
import type { AciString, ServiceIdString } from '../types/ServiceId';
import type { SignalService as Proto } from '../protobuf';
import type { UploadedAttachmentType } from '../types/Attachment';
import type { RawBodyRange } from '../types/BodyRange';
import type {
  CallbackResultType,
  StorageServiceCallOptionsType,
  StorageServiceCredentials,
} from '../textsecure/Types';
import type { SendLogCallbackType } from '../textsecure/OutgoingMessage';
import type { EmbeddedContactWithUploadedAvatar } from '../types/EmbeddedContact';
import type { DurationInSeconds } from '../util/durations';
import type { StoryContextType } from '../types/Util';
import type { SendTypesType } from '../util/handleMessageSend';
import type {
  ChallengeType,
  GetGroupLogOptionsType,
  GetProfileOptionsType,
  GetProfileUnauthOptionsType,
  GroupCredentialsType,
  GroupLogResponseType,
  MakeProxiedRequestResultType,
  ProxiedRequestOptionsType,
  StickerPackManifestType,
  WebAPIType,
} from '../textsecure/WebAPI';
import type {
  LinkPreviewImage,
  LinkPreviewMetadata,
} from '../linkPreviews/linkPreviewFetch';

// Copied from `ts/textsecure/SendMessage.ts`
export type IMessageSender = {
  // [!] Used by `fetchKeysForServiceId` (`ts/util/sendToGroup.ts`)
  readonly server: WebAPIType;

  queueJobForServiceId<T>(
    serviceId: ServiceIdString,
    runJob: () => Promise<T>
  ): Promise<T>;

  getTextAttachmentProto(
    attachmentAttrs: OutgoingTextAttachmentType
  ): Proto.TextAttachment;

  getDataOrEditMessage(
    options: Readonly<MessageOptionsType>
  ): Promise<Uint8Array>;

  getDataOrEditMessage(
    options: Readonly<MessageOptionsType>
  ): Promise<Uint8Array>;

  getStoryMessage(options: {
    allowsReplies?: boolean;
    bodyRanges?: Array<RawBodyRange>;
    fileAttachment?: UploadedAttachmentType;
    groupV2?: GroupV2InfoType;
    profileKey: Uint8Array;
    textAttachment?: OutgoingTextAttachmentType;
  }): Promise<Proto.StoryMessage>;

  getContentMessage(
    options: Readonly<MessageOptionsType> &
      Readonly<{
        includePniSignatureMessage?: boolean;
      }>
  ): Promise<Proto.Content>;

  getHydratedMessage(
    attributes: Readonly<MessageOptionsType>
  ): Promise<Message>;

  getTypingContentMessage(
    options: Readonly<{
      recipientId?: ServiceIdString;
      groupId?: Uint8Array;
      groupMembers: ReadonlyArray<ServiceIdString>;
      isTyping: boolean;
      timestamp?: number;
    }>
  ): Proto.Content;

  getAttrsFromGroupOptions(
    options: Readonly<GroupSendOptionsType>
  ): MessageOptionsType;

  sendMessage(
    options: Readonly<{
      messageOptions: MessageOptionsType;
      contentHint: number;
      groupId: string | undefined;
      options?: SendOptionsType;
      urgent: boolean;
      story?: boolean;
      includePniSignatureMessage?: boolean;
    }>
  ): Promise<CallbackResultType>;

  sendMessageProto(
    options: Readonly<{
      callback: (result: CallbackResultType) => void;
      contentHint: number;
      groupId: string | undefined;
      options?: SendOptionsType;
      proto: Proto.Content | Proto.DataMessage | PlaintextContent;
      recipients: ReadonlyArray<ServiceIdString>;
      sendLogCallback?: SendLogCallbackType;
      story?: boolean;
      timestamp: number;
      urgent: boolean;
    }>
  ): Promise<void>;

  sendMessageProtoAndWait({
    timestamp,
    recipients,
    proto,
    contentHint,
    groupId,
    options,
    urgent,
    story,
  }: Readonly<{
    timestamp: number;
    recipients: Array<ServiceIdString>;
    proto: Proto.Content | Proto.DataMessage | PlaintextContent;
    contentHint: number;
    groupId: string | undefined;
    options?: SendOptionsType;
    urgent: boolean;
    story?: boolean;
  }>): Promise<CallbackResultType>;

  sendIndividualProto({
    contentHint,
    groupId,
    serviceId,
    options,
    proto,
    timestamp,
    urgent,
  }: Readonly<{
    contentHint: number;
    groupId?: string;
    serviceId: ServiceIdString | undefined;
    options?: SendOptionsType;
    proto: Proto.DataMessage | Proto.Content | PlaintextContent;
    timestamp: number;
    urgent: boolean;
  }>): Promise<CallbackResultType>;

  sendMessageToServiceId(
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
  ): Promise<CallbackResultType>;

  sendSyncMessage(
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
      storyMessage?: Proto.StoryMessage;
      storyMessageRecipients?: ReadonlyArray<Proto.SyncMessage.Sent.IStoryMessageRecipient>;
    }>
  ): Promise<CallbackResultType>;

  syncReadMessages(
    reads: ReadonlyArray<{
      senderAci?: AciString;
      senderE164?: string;
      timestamp: number;
    }>,
    options?: Readonly<SendOptionsType>
  ): Promise<CallbackResultType>;

  syncView(
    views: ReadonlyArray<{
      senderAci?: AciString;
      senderE164?: string;
      timestamp: number;
    }>,
    options?: SendOptionsType
  ): Promise<CallbackResultType>;

  syncViewOnceOpen(
    viewOnceOpens: ReadonlyArray<{
      senderAci?: AciString;
      senderE164?: string;
      timestamp: number;
    }>,
    options?: Readonly<SendOptionsType>
  ): Promise<CallbackResultType>;

  sendCallingMessage(
    serviceId: ServiceIdString,
    callingMessage: Readonly<Proto.ICallingMessage>,
    timestamp: number,
    urgent: boolean,
    options?: Readonly<SendOptionsType>
  ): Promise<CallbackResultType>;

  sendDeliveryReceipt(
    options: Readonly<{
      senderAci: AciString;
      timestamps: Array<number>;
      isDirectConversation: boolean;
      options?: Readonly<SendOptionsType>;
    }>
  ): Promise<CallbackResultType>;

  sendReadReceipt(
    options: Readonly<{
      senderAci: AciString;
      timestamps: Array<number>;
      isDirectConversation: boolean;
      options?: Readonly<SendOptionsType>;
    }>
  ): Promise<CallbackResultType>;

  sendViewedReceipt(
    options: Readonly<{
      senderAci: AciString;
      timestamps: Array<number>;
      isDirectConversation: boolean;
      options?: Readonly<SendOptionsType>;
    }>
  ): Promise<CallbackResultType>;

  makeSendLogCallback(
    options: Readonly<{
      contentHint: number;
      messageId?: string;
      proto: Buffer;
      sendType: SendTypesType;
      timestamp: number;
      urgent: boolean;
      hasPniSignatureMessage: boolean;
    }>
  ): SendLogCallbackType;

  sendGroupProto(
    options: Readonly<{
      contentHint: number;
      groupId: string | undefined;
      options?: SendOptionsType;
      proto: Proto.Content;
      recipients: ReadonlyArray<ServiceIdString>;
      sendLogCallback?: SendLogCallbackType;
      story?: boolean;
      timestamp: number;
      urgent: boolean;
    }>
  ): Promise<CallbackResultType>;

  getSenderKeyDistributionMessage(
    distributionId: string,
    {
      throwIfNotInDatabase,
      timestamp,
    }: { throwIfNotInDatabase?: boolean; timestamp: number }
  ): Promise<Proto.Content>;

  sendSenderKeyDistributionMessage(
    {
      contentHint,
      distributionId,
      groupId,
      serviceIds,
      throwIfNotInDatabase,
      story,
      urgent,
    }: Readonly<{
      contentHint?: number;
      distributionId: string;
      groupId: string | undefined;
      serviceIds: ReadonlyArray<ServiceIdString>;
      throwIfNotInDatabase?: boolean;
      story?: boolean;
      urgent: boolean;
    }>,
    options?: Readonly<SendOptionsType>
  ): Promise<CallbackResultType>;

  getProfile(
    serviceId: ServiceIdString,
    options: GetProfileOptionsType | GetProfileUnauthOptionsType
  ): ReturnType<WebAPIType['getProfile']>;

  getAvatar(path: string): Promise<Uint8Array>;
  getSticker(packId: string, stickerId: number): Promise<Uint8Array>;
  getStickerPackManifest(packId: string): Promise<StickerPackManifestType>;

  createGroup(
    group: Readonly<Proto.IGroup>,
    options: Readonly<GroupCredentialsType>
  ): Promise<Proto.IGroupResponse>;

  uploadGroupAvatar(
    avatar: Readonly<Uint8Array>,
    options: Readonly<GroupCredentialsType>
  ): Promise<string>;

  getGroup(
    options: Readonly<GroupCredentialsType>
  ): Promise<Proto.IGroupResponse>;

  getGroupFromLink(
    groupInviteLink: string | undefined,
    auth: Readonly<GroupCredentialsType>
  ): Promise<Proto.GroupJoinInfo>;

  getGroupLog(
    options: GetGroupLogOptionsType,
    credentials: GroupCredentialsType
  ): Promise<GroupLogResponseType>;

  getGroupAvatar(key: string): Promise<Uint8Array>;

  modifyGroup(
    changes: Readonly<Proto.GroupChange.IActions>,
    options: Readonly<GroupCredentialsType>,
    inviteLinkBase64?: string
  ): Promise<Proto.IGroupChangeResponse>;

  fetchLinkPreviewMetadata(
    href: string,
    abortSignal: AbortSignal
  ): Promise<null | LinkPreviewMetadata>;

  fetchLinkPreviewImage(
    href: string,
    abortSignal: AbortSignal
  ): Promise<null | LinkPreviewImage>;

  makeProxiedRequest(
    url: string,
    options?: Readonly<ProxiedRequestOptionsType>
  ): Promise<MakeProxiedRequestResultType>;

  getStorageCredentials(): Promise<StorageServiceCredentials>;

  getStorageManifest(
    options: Readonly<StorageServiceCallOptionsType>
  ): Promise<Uint8Array>;

  getStorageRecords(
    data: Readonly<Uint8Array>,
    options: Readonly<StorageServiceCallOptionsType>
  ): Promise<Uint8Array>;

  modifyStorageRecords(
    data: Readonly<Uint8Array>,
    options: Readonly<StorageServiceCallOptionsType>
  ): Promise<Uint8Array>;

  getGroupMembershipToken(
    options: Readonly<GroupCredentialsType>
  ): Promise<Proto.IExternalGroupCredential>;

  sendChallengeResponse(
    challengeResponse: Readonly<ChallengeType>
  ): Promise<void>;
};

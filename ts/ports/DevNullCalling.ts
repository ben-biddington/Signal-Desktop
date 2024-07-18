/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CallLinkAuthCredentialPresentation } from '@signalapp/libsignal-client/zkgroup';
import type {
  CallLinkRootKey,
  PeekInfo,
  GroupCall,
  VideoRequest,
  VideoFrameSource,
  AudioDevice,
} from '@signalapp/ringrtc';
import type { SignalService as Proto } from '../protobuf';
import type {
  CallingReduxInterface,
  NotifyScreenShareStatusOptionsType,
} from '../services/calling';
import type {
  GroupCallPeekInfoType,
  GroupCallParticipantInfoType,
} from '../state/ducks/calling';
import type { ProcessedEnvelope } from '../textsecure/Types';
import type {
  CallMode,
  GroupCallConnectionState,
  GroupCallJoinState,
  PresentableSource,
  PresentedSource,
  AvailableIODevicesType,
  MediaDeviceSettings,
} from '../types/Calling';
import type {
  CallLinkType,
  CallLinkStateType,
  CallLinkRestrictions,
  ReadCallLinkState,
} from '../types/CallLink';
import type { AciString } from '../types/ServiceId';
import type { ICalling } from './ICalling';
import type { ConversationType } from '../state/ducks/conversations';

const resolveVoid = () => Promise.resolve();
const resolve = <T>(result: T) => Promise.resolve(result);
const resolveAny = <T>() => Promise.resolve({} as T);

export class DevNullCalling implements ICalling {
  initialize = (
    reduxInterface: CallingReduxInterface,
    sfuUrl: string
  ): void => {};
  startCallingLobby = (
    options: Readonly<{
      conversation: Readonly<ConversationType>;
      hasLocalAudio: boolean;
      hasLocalVideo: boolean;
    }>
  ): Promise<
    | undefined
    | ({ hasLocalAudio: boolean; hasLocalVideo: boolean } & (
        | { callMode: CallMode.Direct }
        | {
            callMode: CallMode.Group;
            connectionState: GroupCallConnectionState;
            joinState: GroupCallJoinState;
            peekInfo?: GroupCallPeekInfoType;
            remoteParticipants: Array<GroupCallParticipantInfoType>;
          }
      ))
  > => resolve(undefined);
  stopCallingLobby = (conversationId?: string): void => {};
  createCallLink = (): Promise<CallLinkType> => resolveAny();
  updateCallLinkName = (
    callLink: CallLinkType,
    name: string
  ): Promise<CallLinkStateType> => resolveAny();
  updateCallLinkRestrictions = (
    callLink: CallLinkType,
    restrictions: CallLinkRestrictions
  ): Promise<CallLinkStateType> => resolveAny();
  readCallLink = (): Promise<
    | {
        callLinkState: ReadCallLinkState;
        errorStatusCode: undefined;
      }
    | {
        callLinkState: undefined;
        errorStatusCode: number;
      }
  > =>
    resolve({
      callLinkState: undefined,
      errorStatusCode: 0,
    });
  startCallLinkLobby = (
    options: Readonly<{
      callLinkRootKey: CallLinkRootKey;
      adminPasskey: Buffer | undefined;
      hasLocalAudio: boolean;
      hasLocalVideo?: boolean;
    }>
  ): Promise<
    | undefined
    | {
        callMode: CallMode.Adhoc;
        connectionState: GroupCallConnectionState;
        hasLocalAudio: boolean;
        hasLocalVideo: boolean;
        joinState: GroupCallJoinState;
        peekInfo?: GroupCallPeekInfoType;
        remoteParticipants: Array<GroupCallParticipantInfoType>;
      }
  > => resolveAny();
  startOutgoingDirectCall = (
    conversationId: string,
    hasLocalAudio: boolean,
    hasLocalVideo: boolean
  ): Promise<void> => resolveVoid();
  cleanupStaleRingingCalls = (): Promise<void> => resolveVoid();
  peekGroupCall = (conversationId: string): Promise<PeekInfo> => resolveAny();
  peekCallLinkCall = (
    roomId: string,
    rootKey: string | undefined
  ): Promise<PeekInfo> => resolveAny();
  connectGroupCall = (): GroupCall => ({} as GroupCall);
  connectCallLinkCall = (options: {
    roomId: string;
    authCredentialPresentation: CallLinkAuthCredentialPresentation;
    callLinkRootKey: CallLinkRootKey;
    adminPasskey: Buffer | undefined;
  }): GroupCall => ({} as GroupCall);
  joinGroupCall = (
    conversationId: string,
    hasLocalAudio: boolean,
    hasLocalVideo: boolean,
    shouldRing: boolean
  ): Promise<void> => resolveVoid();
  joinCallLinkCall = (options: {
    roomId: string;
    rootKey: string;
    adminKey: string | undefined;
    hasLocalAudio: boolean;
    hasLocalVideo: boolean;
  }): Promise<void> => resolveVoid();
  setGroupCallVideoRequest = (
    conversationId: string,
    resolutions: Array<VideoRequest>,
    speakerHeight: number
  ): void => {};
  groupMembersChanged = (conversationId: string): void => {};
  approveUser = (conversationId: string, aci: AciString): void => {};
  denyUser = (conversationId: string, aci: AciString): void => {};
  removeClient = (conversationId: string, demuxId: number): void => {};
  getGroupCallVideoFrameSource = (
    conversationId: string,
    demuxId: number
  ): VideoFrameSource => ({} as VideoFrameSource);
  sendGroupCallRaiseHand = (conversationId: string, raise: boolean): void => {};
  sendGroupCallReaction = (conversationId: string, value: string): void => {};
  setAllRtcStatsInterval = (intervalMillis: number | null): void => {};
  acceptDirectCall = (
    conversationId: string,
    asVideoCall: boolean
  ): Promise<void> => resolveVoid();
  declineDirectCall = (conversationId: string): void => {};
  declineGroupCall = (conversationId: string, ringId: bigint): void => {};
  hangup = (conversationId: string, reason: string): void => {};
  hangupAllCalls = (reason: string): void => {};
  setOutgoingAudio = (conversationId: string, enabled: boolean): void => {};
  setOutgoingVideo = (conversationId: string, enabled: boolean): void => {};
  getPresentingSources = (): Promise<Array<PresentableSource>> => resolveAny();
  setPresenting = (
    conversationId: string,
    hasLocalVideo: boolean,
    source?: PresentedSource
  ): Promise<void> => resolveVoid();
  notifyScreenShareStatus = (
    options: NotifyScreenShareStatusOptionsType
  ): Promise<void> => resolveVoid();
  getAvailableIODevices = (): Promise<AvailableIODevicesType> => resolveAny();
  getMediaDeviceSettings = (): Promise<MediaDeviceSettings> => resolveAny();
  setPreferredMicrophone = (device: AudioDevice): void => {};
  setPreferredSpeaker = (device: AudioDevice): void => {};
  enableLocalCamera = (): void => {};
  disableLocalVideo = (): void => {};
  setPreferredCamera = (device: string): Promise<void> => resolveVoid();
  handleCallingMessage = (
    envelope: ProcessedEnvelope,
    callingMessage: Proto.ICallingMessage
  ): Promise<void> => resolveVoid();
  updateCallHistoryForAdhocCall = (
    roomId: string,
    joinState: GroupCallJoinState | null,
    peekInfo: PeekInfo | null
  ): Promise<void> => resolveVoid();
  updateCallHistoryForGroupCallOnLocalChanged = (
    conversationId: string,
    joinState: GroupCallJoinState | null,
    peekInfo: PeekInfo | null
  ): Promise<void> => resolveVoid();
  updateCallHistoryForGroupCallOnPeek = (
    conversationId: string,
    joinState: GroupCallJoinState | null,
    peekInfo: PeekInfo | null
  ): Promise<void> => resolveVoid();
}

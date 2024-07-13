/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  AudioDevice,
  CallLinkRootKey,
  GroupCall,
  PeekInfo,
  VideoFrameSource,
  VideoRequest,
} from '@signalapp/ringrtc';
import type { CallLinkAuthCredentialPresentation } from '@signalapp/libsignal-client/zkgroup';
import type { ConversationType } from '../sql/Interface';
import type {
  GroupCallParticipantInfoType,
  GroupCallPeekInfoType,
} from '../state/ducks/calling';
import type {
  AvailableIODevicesType,
  CallMode,
  GroupCallConnectionState,
  GroupCallJoinState,
  MediaDeviceSettings,
  PresentableSource,
  PresentedSource,
} from '../types/Calling';
import type {
  CallLinkRestrictions,
  CallLinkStateType,
  CallLinkType,
  ReadCallLinkState,
} from '../types/CallLink';
import type { AciString } from '../types/ServiceId';
import type {
  CallingReduxInterface,
  NotifyScreenShareStatusOptionsType,
} from '../services/calling';
import type { ProcessedEnvelope } from '../textsecure/Types';
import type { SignalService as Proto } from '../protobuf';

export type ICalling = {
  initialize: (reduxInterface: CallingReduxInterface, sfuUrl: string) => void;
  startCallingLobby(
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
  >;

  stopCallingLobby: (conversationId?: string) => void;
  createCallLink: () => Promise<CallLinkType>;
  updateCallLinkName: (
    callLink: CallLinkType,
    name: string
  ) => Promise<CallLinkStateType>;
  updateCallLinkRestrictions: (
    callLink: CallLinkType,
    restrictions: CallLinkRestrictions
  ) => Promise<CallLinkStateType>;
  readCallLink: (
    options: Readonly<{
      callLinkRootKey: CallLinkRootKey;
    }>
  ) => Promise<
    | {
        callLinkState: ReadCallLinkState;
        errorStatusCode: undefined;
      }
    | {
        callLinkState: undefined;
        errorStatusCode: number;
      }
  >;
  startCallLinkLobby: (
    options: Readonly<{
      callLinkRootKey: CallLinkRootKey;
      adminPasskey: Buffer | undefined;
      hasLocalAudio: boolean;
      hasLocalVideo?: boolean;
    }>
  ) => Promise<
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
  >;
  startOutgoingDirectCall: (
    conversationId: string,
    hasLocalAudio: boolean,
    hasLocalVideo: boolean
  ) => Promise<void>;
  cleanupStaleRingingCalls: () => Promise<void>;
  peekGroupCall: (conversationId: string) => Promise<PeekInfo>;
  peekCallLinkCall: (
    roomId: string,
    rootKey: string | undefined
  ) => Promise<PeekInfo>;
  connectGroupCall: (
    conversationId: string,
    {
      groupId,
      publicParams,
      secretParams,
    }: {
      groupId: string;
      publicParams: string;
      secretParams: string;
    }
  ) => GroupCall;
  connectCallLinkCall: (options: {
    roomId: string;
    authCredentialPresentation: CallLinkAuthCredentialPresentation;
    callLinkRootKey: CallLinkRootKey;
    adminPasskey: Buffer | undefined;
  }) => GroupCall;
  joinGroupCall: (
    conversationId: string,
    hasLocalAudio: boolean,
    hasLocalVideo: boolean,
    shouldRing: boolean
  ) => Promise<void>;
  joinCallLinkCall: (options: {
    roomId: string;
    rootKey: string;
    adminKey: string | undefined;
    hasLocalAudio: boolean;
    hasLocalVideo: boolean;
  }) => Promise<void>;
  setGroupCallVideoRequest: (
    conversationId: string,
    resolutions: Array<VideoRequest>,
    speakerHeight: number
  ) => void;
  groupMembersChanged: (conversationId: string) => void;
  approveUser: (conversationId: string, aci: AciString) => void;
  denyUser: (conversationId: string, aci: AciString) => void;
  removeClient: (conversationId: string, demuxId: number) => void;
  getGroupCallVideoFrameSource: (
    conversationId: string,
    demuxId: number
  ) => VideoFrameSource;
  sendGroupCallRaiseHand: (conversationId: string, raise: boolean) => void;
  sendGroupCallReaction: (conversationId: string, value: string) => void;
  setAllRtcStatsInterval: (intervalMillis: number | null) => void;
  acceptDirectCall: (
    conversationId: string,
    asVideoCall: boolean
  ) => Promise<void>;
  declineDirectCall: (conversationId: string) => void;
  declineGroupCall: (conversationId: string, ringId: bigint) => void;
  hangup: (conversationId: string, reason: string) => void;
  hangupAllCalls: (reason: string) => void;
  setOutgoingAudio: (conversationId: string, enabled: boolean) => void;
  setOutgoingVideo: (conversationId: string, enabled: boolean) => void;
  getPresentingSources: () => Promise<Array<PresentableSource>>;
  setPresenting: (
    conversationId: string,
    hasLocalVideo: boolean,
    source?: PresentedSource
  ) => Promise<void>;
  notifyScreenShareStatus: (
    options: NotifyScreenShareStatusOptionsType
  ) => Promise<void>;
  getAvailableIODevices: () => Promise<AvailableIODevicesType>;
  getMediaDeviceSettings: () => Promise<MediaDeviceSettings>;
  setPreferredMicrophone: (device: AudioDevice) => void;
  setPreferredSpeaker: (device: AudioDevice) => void;
  enableLocalCamera: () => void;
  disableLocalVideo: () => void;
  setPreferredCamera: (device: string) => Promise<void>;
  handleCallingMessage: (
    envelope: ProcessedEnvelope,
    callingMessage: Proto.ICallingMessage
  ) => Promise<void>;
  updateCallHistoryForAdhocCall: (
    roomId: string,
    joinState: GroupCallJoinState | null,
    peekInfo: PeekInfo | null
  ) => Promise<void>;
  updateCallHistoryForGroupCallOnLocalChanged: (
    conversationId: string,
    joinState: GroupCallJoinState | null,
    peekInfo: PeekInfo | null
  ) => Promise<void>;
  updateCallHistoryForGroupCallOnPeek: (
    conversationId: string,
    joinState: GroupCallJoinState | null,
    peekInfo: PeekInfo | null
  ) => Promise<void>;
};

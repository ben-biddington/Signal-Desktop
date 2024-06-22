import type { CombineConversationsParams } from '../ConversationController';
import type {
  ConversationAttributesType,
  ConversationAttributesTypeType,
} from '../model-types';
import type { ConversationModel } from '../models/conversations';
import type { ServiceIdString } from '../types/ServiceId';

// Based on `ts/ConversationController.ts`
export type IConversationController = {
  updateUnreadCount: () => void;
  onEmpty: () => void;
  get: (id?: string | null) => ConversationModel | undefined;
  getAll: () => Array<ConversationModel>;
  dangerouslyCreateAndAdd: (
    attributes: Partial<ConversationAttributesType>
  ) => ConversationModel;
  dangerouslyRemoveById: (id: string) => void;
  getOrCreate: (
    identifier: string | null,
    type: ConversationAttributesTypeType,
    additionalInitialProps: Partial<ConversationAttributesType>
  ) => ConversationModel;
  getOrCreateAndWait: (
    id: string | null,
    type: ConversationAttributesTypeType,
    additionalInitialProps: Partial<ConversationAttributesType>
  ) => Promise<ConversationModel>;
  getConversationId: (address: string | null) => string | null;
  getOurConversationId: () => string | undefined;
  getOurConversationIdOrThrow: () => string;
  getOurConversation: () => ConversationModel | undefined;
  getOurConversationOrThrow: () => ConversationModel;
  getOrCreateSignalConversation: () => Promise<ConversationModel>;
  isSignalConversationId: (conversationId: string) => boolean;
  areWePrimaryDevice: () => boolean;
  lookupOrCreate: ({
    e164,
    serviceId,
    reason,
  }: {
    e164?: string | null;
    serviceId?: ServiceIdString | null;
    reason: string;
  }) => ConversationModel | undefined;
  checkForConflicts: () => Promise<void>;
  combineConversations: (options: CombineConversationsParams) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ensureGroup: (groupId: string, additionalInitProps: any) => string;
  getConversationForTargetMessage: (
    targetFromId: string,
    targetTimestamp: number
  ) => Promise<ConversationModel | null | undefined>;
  getAllGroupsInvolvingServiceId: (
    serviceId: ServiceIdString
  ) => Promise<Array<ConversationModel>>;
  getByDerivedGroupV2Id: (groupId: string) => ConversationModel | undefined;
  reset: () => void;
  load: () => Promise<void>;
  forceRerender: (identifiers?: Array<string>) => Promise<void>;
  onConvoOpenStart: (conversationId: string) => void;
  onConvoMessageMount: (conversationId: string) => void;
  repairPinnedConversations: () => void;
  clearShareMyPhoneNumber: () => Promise<void>;
};

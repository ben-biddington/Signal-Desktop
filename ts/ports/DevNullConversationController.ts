/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { ConversationAttributesType } from '../model-types.d';
import { ConversationModelCollectionType } from '../model-types.d';
import { ConversationModel } from '../models/conversation-model';
import type { IConversationController } from './IConversationController';

export class DevNullConversationController implements IConversationController {
  private readonly _conversations: ConversationModelCollectionType =
    new ConversationModelCollectionType();

  get conversations(): ConversationModelCollectionType {
    return this._conversations;
  }

  constructor(...conversations: Array<ConversationAttributesType>) {
    conversations.forEach(conversation =>
      this._conversations.add(this.create(conversation))
    );
  }

  create = (attributes: ConversationAttributesType): ConversationModel =>
    new ConversationModel(attributes);

  updateUnreadCount = () => {};
  onEmpty = () => {};
  get = (id?: string | null): ConversationModel | undefined =>
    this._conversations.find(it => it.id === id);
  getAll = () => this._conversations.toArray();
  dangerouslyCreateAndAdd = () => {
    return {} as ConversationModel;
  };
  dangerouslyRemoveById = () => {};
  getOrCreate = () => ({} as ConversationModel);
  getOrCreateAndWait = () => Promise.resolve({} as ConversationModel);
  getConversationId = () => null;
  getOurConversationId = () => this.getOurConversation().id;
  getOurConversationIdOrThrow = () => '';
  getOurConversation = () => this._conversations.at(0);
  getOurConversationOrThrow = () => ({} as ConversationModel);
  getOrCreateSignalConversation = () =>
    Promise.resolve({} as ConversationModel);
  isSignalConversationId = () => true;
  areWePrimaryDevice = () => true;
  lookupOrCreate = () => ({} as ConversationModel);
  checkForConflicts = () => Promise.resolve();
  combineConversations = () => Promise.resolve();
  ensureGroup = () => '';
  getConversationForTargetMessage = () => Promise.resolve(undefined);
  getAllGroupsInvolvingServiceId = () => Promise.resolve([]);
  getByDerivedGroupV2Id = () => undefined;
  reset = () => {};
  load = () => {
    return Promise.resolve();
  };
  forceRerender = () => Promise.resolve();
  onConvoOpenStart = () => {};
  onConvoMessageMount = () => {};
  repairPinnedConversations = () => {};
  clearShareMyPhoneNumber = () => Promise.resolve();
  maybeMergeContacts = () => ({
    conversation: {} as ConversationModel,
    mergePromises: [],
  });

  searchMessages = () => Promise.resolve([]);
}

// [!] Copied from `start` in `ts/ConversationController.ts`
export const start = (
  conversationController: DevNullConversationController
) => {
  window.ConversationController = conversationController;
  window.getConversations = () => conversationController.conversations;
};

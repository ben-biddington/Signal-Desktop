/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { ConversationModel } from '../models/conversations';
import type { IConversationController } from './IConversationController';

export class DevNullConversationController implements IConversationController {
  updateUnreadCount = () => {};
  onEmpty = () => {};
  get = () => undefined;
  getAll = () => [];
  dangerouslyCreateAndAdd = () => {
    return {} as ConversationModel;
  };
  dangerouslyRemoveById = () => {};
  getOrCreate = () => ({} as ConversationModel);
  getOrCreateAndWait = () => Promise.resolve({} as ConversationModel);
  getConversationId = () => null;
  getOurConversationId = () => undefined;
  getOurConversationIdOrThrow = () => '';
  getOurConversation = () => ({} as ConversationModel);
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
  load = () => Promise.resolve();
  forceRerender = () => Promise.resolve();
  onConvoOpenStart = () => {};
  onConvoMessageMount = () => {};
  repairPinnedConversations = () => {};
  clearShareMyPhoneNumber = () => Promise.resolve();
}

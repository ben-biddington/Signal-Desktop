/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CallLinkRestrictions } from '@signalapp/ringrtc';
import type {
  ClientInterface,
  GetUnreadByConversationAndMarkReadResultType,
  GetAllStoriesResultType,
  StoryDistributionWithMembersType,
  PageMessagesResultType,
} from '../sql/Interface';
import type { AttachmentDownloadJobType } from '../types/AttachmentDownload';

const pretty = (what: unknown) => JSON.stringify(what, null, 2);

export class DevNullClientInterface implements ClientInterface {
  private verbose: boolean;

  constructor(verbose: boolean) {
    this.verbose = verbose;
  }

  private print = (args: []) => {
    if (this.verbose) {
      // eslint-disable-next-line no-console
      console.log(
        `[DevNullClientInterface] ${pretty(args)}\n${
          new Error('Not an error, printing stack').stack
        }`
      );
    }
  };
  private void = (...args: []) => {
    this.print(args);
    return Promise.resolve();
  };
  private zero = (...args: []) => {
    this.print(args);
    return Promise.resolve(0);
  };
  private empty = (...args: []) => {
    this.print(args);
    return Promise.resolve([]);
  };
  private undefined = (...args: []) => {
    this.print(args);
    return Promise.resolve(undefined);
  };

  replaceAllEndorsementsForGroup = this.void;
  _getAllEditedMessages = this.empty;

  close = () => Promise.resolve();
  pauseWriteAccess = () => Promise.resolve();
  resumeWriteAccess = () => Promise.resolve();
  removeDB = () => Promise.resolve();

  removeIndexedDBFiles = this.void;
  removeIdentityKeyById = this.zero;
  removeAllIdentityKeys = this.zero;

  removeKyberPreKeyById = this.zero;

  removeKyberPreKeysByServiceId = this.void;
  removeAllKyberPreKeys = this.zero;
  removePreKeyById = this.zero;
  removePreKeysByServiceId = this.void;
  removeAllPreKeys = this.zero;
  removeSignedPreKeyById = this.zero;
  removeSignedPreKeysByServiceId = this.void;
  removeAllSignedPreKeys = this.zero;
  removeAllItems = this.zero;
  removeItemById = this.zero;
  createOrUpdateSenderKey = this.void;
  getSenderKeyById = () => Promise.resolve(undefined);
  removeAllSenderKeys = this.void;
  getAllSenderKeys = () => Promise.resolve([]);
  removeSenderKeyById = this.void;
  insertSentProto = this.zero;
  deleteSentProtosOlderThan = this.void;
  deleteSentProtoByMessageId = this.void;
  insertProtoRecipients = this.void;
  deleteSentProtoRecipient = () =>
    Promise.resolve({ successfulPhoneNumberShares: [] });
  getSentProtoByRecipient = () => Promise.resolve(undefined);
  removeAllSentProtos = this.void;
  getAllSentProtos = this.empty;
  _getAllSentProtoRecipients = this.empty;
  _getAllSentProtoMessageIds = this.empty;
  createOrUpdateSession = this.void;
  createOrUpdateSessions = this.void;
  commitDecryptResult = this.void;
  bulkAddSessions = this.void;
  removeSessionById = this.zero;
  removeSessionsByConversation = this.void;
  removeSessionsByServiceId = this.void;
  removeAllSessions = this.zero;
  getAllSessions = this.empty;
  getConversationCount = this.zero;
  saveConversation = this.void;
  saveConversations = this.void;
  getConversationById = () => Promise.resolve(undefined);
  updateConversations = this.void;
  _removeAllConversations = this.void;
  updateAllConversationColors = this.void;
  removeAllProfileKeyCredentials = this.void;
  getAllConversations = this.empty;
  getAllConversationIds = this.empty;
  getAllGroupsInvolvingServiceId = this.empty;
  deleteAllEndorsementsForGroup = this.void;
  getGroupSendCombinedEndorsementExpiration = this.zero;
  getMessageCount = this.zero;
  getStoryCount = this.zero;
  saveMessage = () => Promise.resolve('');
  saveMessages = this.empty;
  removeMessage = this.void;
  removeMessages = this.void;
  pageMessages = () => Promise.resolve({} as PageMessagesResultType);
  finishPageMessages = this.void;
  getTotalUnreadForConversation = this.zero;
  getTotalUnreadMentionsOfMeForConversation = this.zero;
  getOldestUnreadMentionOfMeForConversation = () =>
    Promise.resolve({ id: '', received_at: 0, sent_at: 0 });

  getUnreadByConversationAndMarkRead = () =>
    Promise.resolve({} as GetUnreadByConversationAndMarkReadResultType);

  getUnreadEditedMessagesAndMarkRead = () =>
    Promise.resolve({} as GetUnreadByConversationAndMarkReadResultType);

  getUnreadReactionsAndMarkRead = this.empty;

  markReactionAsRead = () => Promise.resolve(undefined);

  removeReactionFromConversation = this.void;

  getReactionByTimestamp = this.undefined;

  addReaction = this.void;
  _getAllReactions = this.empty;
  _removeAllReactions = this.void;
  getMessageBySender = this.undefined;
  getMessageById = this.undefined;
  getMessagesById = this.empty;
  _getAllMessages = this.empty;
  _getAllEditedMessagee = this.empty;
  _removeAllMessages = this.void;
  getAllMessageIds = this.empty;
  getMessagesBySentAt = this.empty;
  getExpiredMessages = this.empty;
  getMessagesUnexpectedlyMissingExpirationStartTimestamp = this.empty;
  getSoonestMessageExpiry = this.zero;
  getNextTapToViewMessageTimestampToAgeOut = this.undefined;
  getTapToViewMessagesNeedingErase = this.empty;
  getAllStories = () => Promise.resolve({} as GetAllStoriesResultType);
  getMessageMetricsForConversation = () =>
    Promise.resolve({
      totalUnseen: 0,
    });
  getConversationMessageStats = () =>
    Promise.resolve({
      hasUserInitiatedMessages: false,
    });
  getLastConversationMessage = this.undefined;
  getAllCallHistory = this.empty;
  clearCallHistory = this.empty;
  cleanupCallHistoryMessages = this.void;
  getCallHistoryUnreadCount = this.zero;
  markCallHistoryRead = this.void;
  markAllCallHistoryRead = this.empty;
  getCallHistoryMessageByCallId = this.undefined;
  getCallHistory = this.undefined;
  getCallHistoryGroupsCount = this.zero;
  getCallHistoryGroups = this.empty;
  saveCallHistory = this.void;
  hasGroupCallHistoryMessage = () => Promise.resolve(false);
  markCallHistoryMissed = this.void;
  getRecentStaleRingsAndMarkOlderMissed = this.empty;
  callLinkExists = () => Promise.resolve(false);
  getAllCallLinks = this.empty;
  getCallLinkByRoomId = this.undefined;
  insertCallLink = this.void;
  updateCallLinkAdminKeyByRoomId = this.void;
  updateCallLinkState = () =>
    Promise.resolve({
      roomId: '',
      rootKey: '',
      adminKey: null,
      name: '',
      restrictions: CallLinkRestrictions.None,
      // Revocation is not supported currently but still returned by the server
      revoked: false,
      // Guaranteed from RingRTC readCallLink, but locally may be null immediately after
      // CallLinkUpdate sync and before readCallLink
      expiration: null,
    });
  migrateConversationMessages = this.void;
  getMessagesBetween = this.empty;
  getNearbyMessageFromDeletedSet = () => Promise.resolve(null);
  saveEditedMessage = this.void;
  saveEditedMessages = this.void;
  getMostRecentAddressableMessages = this.empty;
  removeSyncTaskById = this.void;
  saveSyncTasks = this.void;
  getAllSyncTasks = this.empty;
  getUnprocessedCount = this.zero;
  getUnprocessedByIdsAndIncrementAttempts = this.empty;
  getAllUnprocessedIds = this.empty;
  updateUnprocessedWithData = this.void;
  updateUnprocessedsWithData = this.void;
  getUnprocessedById = this.undefined;
  removeUnprocessed = this.void;
  removeAllUnprocessed = this.void;
  getAttachmentDownloadJob = () => ({} as AttachmentDownloadJobType);
  getNextAttachmentDownloadJobs = this.empty;
  saveAttachmentDownloadJob = this.void;
  resetAttachmentDownloadActive = this.void;
  removeAttachmentDownloadJob = this.void;
  getNextAttachmentBackupJobs = this.empty;
  saveAttachmentBackupJob = this.void;
  markAllAttachmentBackupJobsInactive = this.void;
  removeAttachmentBackupJob = this.void;
  clearAllBackupCdnObjectMetadata = this.void;
  saveBackupCdnObjectMetadata = this.void;
  getBackupCdnObjectMetadata = this.undefined;
  createOrUpdateStickerPack = this.void;
  updateStickerPackStatus = this.void;
  updateStickerPackInfo = this.void;
  createOrUpdateSticker = this.void;
  updateStickerLastUsed = this.void;
  addStickerPackReference = this.void;
  deleteStickerPackReference = this.empty;
  getStickerCount = this.zero;
  deleteStickerPack = this.empty;
  getAllStickerPacks = this.empty;
  addUninstalledStickerPack = this.void;
  removeUninstalledStickerPack = this.void;
  getInstalledStickerPacks = this.empty;
  getUninstalledStickerPacks = this.empty;
  installStickerPack = this.void;
  uninstallStickerPack = this.void;
  getStickerPackInfo = this.undefined;
  getAllStickers = this.empty;
  getRecentStickers = this.empty;

  clearAllErrorStickerPackAttempts = this.void;
  updateEmojiUsage = this.void;
  getRecentEmojis = this.empty;
  getAllBadges = this.empty;
  updateOrCreateBadges = this.void;
  badgeImageFileDownloaded = this.void;
  _getAllStoryDistributions = this.empty;
  _getAllStoryDistributionMembers = this.empty;
  _deleteAllStoryDistributions = this.void;
  createNewStoryDistribution = this.void;
  getAllStoryDistributionsWithMembers = this.empty;
  getStoryDistributionWithMembers = () =>
    Promise.resolve({} as StoryDistributionWithMembersType);
  modifyStoryDistribution = this.void;
  modifyStoryDistributionMembers = this.void;
  modifyStoryDistributionWithMembers = this.void;
  deleteStoryDistribution = this.void;
  _getAllStoryReads = this.empty;
  _deleteAllStoryReads = this.void;
  addNewStoryRead = this.void;
  getLastStoryReadsForAuthor = this.empty;
  countStoryReadsByConversation = this.zero;
  removeAll = this.void;
  removeAllConfiguration = this.void;
  eraseStorageServiceState = this.void;
  getMessagesNeedingUpgrade = this.empty;
  getMessagesWithVisualMediaAttachments = this.empty;
  getMessagesWithFileAttachments = this.empty;
  getMessageServerGuidsForSpam = this.empty;
  getJobsInQueue = this.empty;
  insertJob = this.void;
  deleteJob = this.void;
  wasGroupCallRingPreviouslyCanceled = () => Promise.resolve(false);
  processGroupCallRingCancellation = this.void;
  cleanExpiredGroupCallRingCancellations = this.void;
  getMaxMessageCounter = this.undefined;
  getStatisticsForLogging = () => Promise.resolve({});
  optimizeFTS = this.undefined;
  updateConversation = this.void;
  removeConversation = this.void;
  flushUpdateConversationBatcher = this.void;
  searchMessages = this.empty;
  getRecentStoryReplies = this.empty;
  getOlderMessagesByConversation = this.empty;
  getNewerMessagesByConversation = this.empty;
  getConversationRangeCenteredOnMessage = () =>
    Promise.resolve({
      older: [],
      newer: [],
      metrics: { totalUnseen: 0 },
    });

  createOrUpdateIdentityKey = this.void;
  getIdentityKeyById = this.undefined;
  bulkAddIdentityKeys = this.void;
  getAllIdentityKeys = this.empty;
  createOrUpdateKyberPreKey = this.void;
  getKyberPreKeyById = this.undefined;
  bulkAddKyberPreKeys = this.void;
  getAllKyberPreKeys = this.empty;
  createOrUpdatePreKey = this.void;
  getPreKeyById = this.undefined;
  bulkAddPreKeys = this.void;
  getAllPreKeys = this.empty;
  createOrUpdateSignedPreKey = this.void;
  getSignedPreKeyById = this.undefined;
  bulkAddSignedPreKeys = this.void;
  getAllSignedPreKeys = this.empty;
  createOrUpdateItem = this.void;
  getItemById = this.undefined;
  getAllItems = () => Promise.resolve({});
  shutdown = this.void;
  removeMessagesInConversation = this.void;
  removeOtherData = this.void;
  cleanupOrphanedAttachments = this.void;
  ensureFilePermissions = this.void;
}

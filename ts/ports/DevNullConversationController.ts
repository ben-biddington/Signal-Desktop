/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { v4 as generateUuid } from 'uuid';
import type { SafeCombineConversationsParams } from '../ConversationController';
import { ConversationController } from '../ConversationController';
import type {
  ConversationAttributesType,
  ConversationAttributesTypeType,
} from '../model-types.d';
import { ConversationModelCollectionType } from '../model-types.d';
import { ConversationModel } from '../models/conversation-model';
import type { AciString, PniString, ServiceIdString } from '../types/ServiceId';
import { isServiceIdString, normalizePni } from '../types/ServiceId';
import { normalizeAci } from '../util/normalizeAci';
import type { IConversationController } from './IConversationController';
import * as log from '../logging/log';
import { strictAssert } from '../util/assert';

// Duplicated from `ts/ConversationController.ts` as not exported
type ConvoMatchType =
  | {
      key: 'serviceId' | 'pni';
      value: ServiceIdString | undefined;
      match: ConversationModel | undefined;
    }
  | {
      key: 'e164';
      value: string | undefined;
      match: ConversationModel | undefined;
    };

export class DevNullConversationController implements IConversationController {
  private _me: ConversationModel;

  // [!] `ConversationModelCollectionType` is not suitable, just here for compiler
  private _conversations: ConversationModelCollectionType =
    new ConversationModelCollectionType();

  private readonly _initialConversations: Array<ConversationAttributesType> =
    [];

  constructor(
    me: ConversationAttributesType,
    initialConversations: Array<ConversationAttributesType> = []
  ) {
    this._me = new ConversationModel(me);
    this._initialConversations = initialConversations;
  }

  get conversations(): ConversationModelCollectionType {
    return this?._conversations;
  }

  use = (conversations: ConversationModelCollectionType): void => {
    this._conversations = conversations;
    this.addAll(this._initialConversations);
  };

  private addAll = (conversations: Array<ConversationAttributesType>) => {
    conversations.forEach(
      conversation =>
        this._conversations.add(
          conversation
        ) /* [!] Don't use `ConversationModel` ctor with `add` as it makes duplicates! */
    );
  };

  updateUnreadCount = () => {};
  onEmpty = () => {};
  get = (id?: string | null): ConversationModel | undefined => {
    return this._conversations.get(id as string);
  };

  getAll = () => this._conversations.toArray();
  dangerouslyCreateAndAdd = () => {
    return {} as ConversationModel;
  };
  dangerouslyRemoveById = () => {};

  // Based on `ts/ConversationController.ts` (not complete duplicate)
  getOrCreate(
    identifier: string | null,
    type: ConversationAttributesTypeType,
    additionalInitialProps: Partial<ConversationAttributesType> = {}
  ): ConversationModel {
    log.info('[DevNullConversationController]', 'getOrCreate', {
      identifier,
      type,
    });

    if (typeof identifier !== 'string') {
      throw new TypeError("'id' must be a string");
    }

    if (type !== 'private' && type !== 'group') {
      throw new TypeError(
        `'type' must be 'private' or 'group'; got: '${type}'`
      );
    }

    let conversation = this._conversations.get(identifier);

    if (conversation) {
      return conversation;
    }

    const id = generateUuid();

    if (type === 'group') {
      conversation = this._conversations.add({
        id,
        serviceId: undefined,
        e164: undefined,
        groupId: identifier,
        type,
        version: 2,
        ...additionalInitialProps,
      });
    } else if (isServiceIdString(identifier)) {
      conversation = this._conversations.add({
        id,
        serviceId: identifier,
        e164: undefined,
        groupId: undefined,
        type,
        version: 2,
        ...additionalInitialProps,
      });
    } else {
      conversation = this._conversations.add({
        id,
        serviceId: undefined,
        e164: identifier,
        groupId: undefined,
        type,
        version: 2,
        ...additionalInitialProps,
      });
    }

    const create = async () => {
      if (!conversation.isValid()) {
        const validationError = conversation.validationError || {};
        log.error(
          'Contact is not valid. Not saving, but adding to collection:',
          conversation.idForLogging(),
          Errors.toLogFormat(validationError)
        );

        return conversation;
      }

      return conversation;
    };

    conversation.initialPromise = create();

    return conversation;
  }

  getOrCreateAndWait = () => Promise.resolve({} as ConversationModel);
  getConversationId = () => null;
  getOurConversationId = () => this.getOurConversation().id;
  getOurConversationIdOrThrow = () => '';
  getOurConversation = () => {
    return this._me;
  };
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
  // [!] There is important behaviour in `ConversationController.maybeMergeContacts`.
  //
  //     Can't call it directly because of errors like:
  //
  //        'ConversationController.get() needs complete initial fetch'
  //
  //     so duplicating it.
  //
  // return new ConversationController(this._conversations).maybeMergeContacts(
  //   args
  // );
  maybeMergeContacts = ({
    aci: providedAci,
    e164,
    pni: providedPni,
    reason,
    fromPniSignature = false,
    mergeOldAndNew = opts =>
      new ConversationController(this._conversations).combineConversations(
        opts
      ),
  }: {
    aci?: AciString;
    e164?: string;
    pni?: PniString;
    reason: string;
    fromPniSignature?: boolean;
    mergeOldAndNew?: (options: SafeCombineConversationsParams) => Promise<void>;
  }) => {
    const dataProvided = [];
    if (providedAci) {
      dataProvided.push(`aci=${providedAci}`);
    }
    if (e164) {
      dataProvided.push(`e164=${e164}`);
    }
    if (providedPni) {
      dataProvided.push(`pni=${providedPni}`);
    }
    if (fromPniSignature) {
      dataProvided.push(`fromPniSignature=${fromPniSignature}`);
    }
    const logId = `maybeMergeContacts/${reason}/${dataProvided.join(',')}`;

    const aci = providedAci
      ? normalizeAci(providedAci, 'maybeMergeContacts.aci')
      : undefined;
    const pni = providedPni
      ? normalizePni(providedPni, 'maybeMergeContacts.pni')
      : undefined;
    const mergePromises: Array<Promise<void>> = [];

    const pniSignatureVerified = aci != null && pni != null && fromPniSignature;

    if (!aci && !e164 && !pni) {
      throw new Error(
        `${logId}: Need to provide at least one of: aci, e164, pni`
      );
    }

    const matches: Array<ConvoMatchType> = [
      {
        key: 'serviceId',
        value: aci,
        match: this.get(aci),
      },
      {
        key: 'e164',
        value: e164,
        match: this.get(e164),
      },
      { key: 'pni', value: pni, match: this.get(pni) },
    ];
    let unusedMatches: Array<ConvoMatchType> = [];

    let targetConversation: ConversationModel | undefined;
    let targetOldServiceIds:
      | {
          aci?: AciString;
          pni?: PniString;
        }
      | undefined;
    let matchCount = 0;
    matches.forEach(item => {
      const { key, value, match } = item;

      if (!value) {
        return;
      }

      if (!match) {
        if (targetConversation) {
          log.info(
            `${logId}: No match for ${key}, applying to target ` +
              `conversation - ${targetConversation.idForLogging()}`
          );
          // Note: This line might erase a known e164 or PNI
          applyChangeToConversation(targetConversation, pniSignatureVerified, {
            [key]: value,
          });
        } else {
          unusedMatches.push(item);
        }
        return;
      }

      matchCount += 1;
      unusedMatches.forEach(unused => {
        strictAssert(unused.value, 'An unused value should always be truthy');

        // Example: If we find that our PNI match has no ACI, then it will be our target.

        if (!targetConversation && !match.get(unused.key)) {
          log.info(
            `${logId}: Match on ${key} does not have ${unused.key}, ` +
              `so it will be our target conversation - ${match.idForLogging()}`
          );
          targetConversation = match;
        }
        // Tricky: PNI can end up in serviceId slot, so we need to special-case it
        if (
          !targetConversation &&
          unused.key === 'serviceId' &&
          match.get(unused.key) === pni
        ) {
          log.info(
            `${logId}: Match on ${key} has serviceId matching incoming pni, ` +
              `so it will be our target conversation - ${match.idForLogging()}`
          );
          targetConversation = match;
        }
        // Tricky: PNI can end up in serviceId slot, so we need to special-case it
        if (
          !targetConversation &&
          unused.key === 'serviceId' &&
          match.get(unused.key) === match.getPni()
        ) {
          log.info(
            `${logId}: Match on ${key} has pni/serviceId which are the same value, ` +
              `so it will be our target conversation - ${match.idForLogging()}`
          );
          targetConversation = match;
        }

        // If PNI match already has an ACI, then we need to create a new one
        if (!targetConversation) {
          targetConversation = this.getOrCreate(unused.value, 'private');
          log.info(
            `${logId}: Match on ${key} already had ${unused.key}, ` +
              `so created new target conversation - ${targetConversation.idForLogging()}`
          );
        }

        targetOldServiceIds = {
          aci: targetConversation.getAci(),
          pni: targetConversation.getPni(),
        };

        log.info(
          `${logId}: Applying new value for ${unused.key} to target conversation`
        );
        applyChangeToConversation(targetConversation, pniSignatureVerified, {
          [unused.key]: unused.value,
        });
      });

      unusedMatches = [];

      if (targetConversation && targetConversation !== match) {
        // We need to grab this before we start taking key data from it. If we're merging
        //   by e164, we want to be sure that is what is rendered in the notification.
        const obsoleteTitleInfo =
          key === 'e164'
            ? pick(match.attributes as ConversationAttributesType, [
                'e164',
                'type',
              ])
            : pick(match.attributes as ConversationAttributesType, [
                'e164',
                'profileFamilyName',
                'profileName',
                'systemGivenName',
                'systemFamilyName',
                'systemNickname',
                'type',
                'username',
              ]);

        // Clear the value on the current match, since it belongs on targetConversation!
        //   Note: we need to do the remove first, because it will clear the lookup!
        log.info(
          `${logId}: Clearing ${key} on match, and adding it to target ` +
            `conversation - ${targetConversation.idForLogging()}`
        );
        const change: Pick<
          Partial<ConversationAttributesType>,
          'serviceId' | 'e164' | 'pni'
        > = {
          [key]: undefined,
        };
        // When the PNI is being used in the serviceId field alone, we need to clear it
        if ((key === 'pni' || key === 'e164') && match.getServiceId() === pni) {
          change.serviceId = undefined;
        }
        applyChangeToConversation(match, pniSignatureVerified, change);

        // Note: The PNI check here is just to be bulletproof; if we know a
        //   serviceId is a PNI, then that should be put in the serviceId field
        //   as well!
        const willMerge =
          !match.getServiceId() && !match.get('e164') && !match.getPni();

        applyChangeToConversation(targetConversation, pniSignatureVerified, {
          [key]: value,
        });

        if (willMerge) {
          log.warn(
            `${logId}: Removing old conversation which matched on ${key}. ` +
              `Merging with target conversation - ${targetConversation.idForLogging()}`
          );
          mergePromises.push(
            mergeOldAndNew({
              current: targetConversation,
              logId,
              obsolete: match,
              obsoleteTitleInfo,
            })
          );
        }
      } else if (targetConversation && !targetConversation?.get(key)) {
        // This is mostly for the situation where PNI was erased when updating e164
        log.debug(
          `${logId}: Re-adding ${key} on target conversation - ` +
            `${targetConversation.idForLogging()}`
        );
        applyChangeToConversation(targetConversation, pniSignatureVerified, {
          [key]: value,
        });
      }

      if (!targetConversation) {
        // log.debug(
        //   `${logId}: Match on ${key} is target conversation - ${match.idForLogging()}`
        // );
        targetConversation = match;
        targetOldServiceIds = {
          aci: targetConversation.getAci(),
          pni: targetConversation.getPni(),
        };
      }
    });

    // If the change is not coming from PNI Signature, and target conversation
    // had PNI and has acquired new ACI and/or PNI we should check if it had
    // a PNI session on the original PNI. If yes - add a PhoneNumberDiscovery notification
    if (
      e164 &&
      pni &&
      targetConversation &&
      targetOldServiceIds?.pni &&
      !fromPniSignature &&
      (targetOldServiceIds.pni !== pni ||
        (aci && targetOldServiceIds.aci !== aci))
    ) {
      targetConversation.unset('needsTitleTransition');
      mergePromises.push(
        targetConversation.addPhoneNumberDiscoveryIfNeeded(
          targetOldServiceIds.pni
        )
      );
    }

    if (targetConversation) {
      return { conversation: targetConversation, mergePromises };
    }

    strictAssert(
      matchCount === 0,
      `${logId}: should be no matches if no targetConversation`
    );

    log.info(`${logId}: Creating a new conversation with all inputs`);

    // This is not our precedence for lookup, but it ensures that the PNI gets into the
    //   serviceId slot if we have no ACI.
    const identifier = aci || pni || e164;
    strictAssert(identifier, `${logId}: identifier must be truthy!`);

    return {
      conversation: this.getOrCreate(identifier, 'private', { e164, pni }),
      mergePromises,
    };
  };

  searchMessages = () => Promise.resolve([]);
}

// Duplicated from `ts/ConversationController.ts`
const { hasOwnProperty } = Object.prototype;
// Duplicated from `ts/ConversationController.ts`
function applyChangeToConversation(
  conversation: ConversationModel,
  pniSignatureVerified: boolean,
  suggestedChange: Partial<
    Pick<ConversationAttributesType, 'serviceId' | 'e164' | 'pni'>
  >
) {
  const change = { ...suggestedChange };

  // Clear PNI if changing e164 without associated PNI
  if (hasOwnProperty.call(change, 'e164') && !change.pni) {
    change.pni = undefined;
  }

  // If we have a PNI but not an ACI, then the PNI will go in the serviceId field
  //   Tricky: We need a special check here, because the PNI can be in the serviceId slot
  if (
    change.pni &&
    !change.serviceId &&
    (!conversation.getServiceId() ||
      conversation.getServiceId() === conversation.getPni())
  ) {
    change.serviceId = change.pni;
  }

  // If we're clearing a PNI, but we didn't have an ACI - we need to clear serviceId field
  if (
    !change.serviceId &&
    hasOwnProperty.call(change, 'pni') &&
    !change.pni &&
    conversation.getServiceId() === conversation.getPni()
  ) {
    change.serviceId = undefined;
  }

  if (hasOwnProperty.call(change, 'serviceId')) {
    conversation.updateServiceId(change.serviceId);
  }
  if (hasOwnProperty.call(change, 'e164')) {
    conversation.updateE164(change.e164);
  }
  if (hasOwnProperty.call(change, 'pni')) {
    conversation.updatePni(change.pni, pniSignatureVerified);
  }

  // Note: we don't do a conversation.set here, because change is limited to these fields
}

// [!] Copied from `start` in `ts/ConversationController.ts`
// We need this here because we MUST use `window.Whisper.ConversationCollection`
// `window.Whisper.ConversationCollection` is assigned in `ts/models/conversations.ts`
export const start = (
  conversationController: DevNullConversationController
) => {
  const conversations = new window.Whisper.ConversationCollection();

  window.ConversationController = conversationController;

  conversationController.use(conversations);

  window.getConversations = () => conversations;
};

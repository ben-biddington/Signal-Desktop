// Copyright 2018 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import moment from 'moment';
import getGuid from 'uuid/v4';
import * as Crypto from '../Crypto';
import * as Curve from '../Curve';
import Data from '../sql/Client';
import * as Groups from '../groups';

import { toBase64 } from '../Bytes';
import { getRandomBytes } from '../Crypto';
import { DevNullClientInterface } from '../ports/DevNullClientInterface';
import { DevNullMessages } from '../ports/DevNullMessages';
import type { Ports } from '../ports/ports';
import { newPorts } from '../ports/ports';
import { initializeMigrations } from '../signal';
import type { LoggerType } from '../types/Logging';
import type { AciString, PniString } from '../types/ServiceId';
import type { SignalCoreType } from '../window';
import * as TypesAttachment from '../types/Attachment';
import * as VisualAttachment from '../types/VisualAttachment';
import * as MessageType from '../types/Message2';
import { Address } from '../types/Address';
import { QualifiedAddress } from '../types/QualifiedAddress';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { createApp } from '../state/roots/createApp';
import { deriveGroupFields } from '../groups';
import {
  start,
  DevNullConversationController,
} from '../ports/DevNullConversationController';
import { backupsService } from '../services/backups';
import { initializeNetworkObserver } from '../services/networkObserver';
import { initializeUpdateListener } from '../services/updateListener';
import { createSafetyNumberViewer } from '../state/roots/createSafetyNumberViewer';
import OS from '../util/os/osMain';
import { markDone } from '../util/registration';
import * as storage from '../services/storage';
import { DevNullInitializeGroupCredentialFetcher } from '../ports/DevNullInitializeGroupCredentialFetcher';
import { DevNullCalling } from '../ports/DevNullCalling';
import { minutesAgo, unixTimestamp } from './date-time';
import { StorySendMode } from '../types/Stories';
import { DurationInSeconds } from '../util/durations';
import { SignalService as Proto } from '../protobuf';
import MemberRoleEnum = Proto.Member.Role;
import { SendStatus } from '../messages/MessageSendState';
import { contacts } from './Contacts';
import type { ConversationAttributesType } from '../model-types';

// Duplicated from `ts/signal.ts`
type StringGetterType = (basePath: string) => string;

// Duplicated from `ts/signal.ts`
type AttachmentsModuleType = {
  getAvatarsPath: StringGetterType;
  getBadgesPath: StringGetterType;
  getDraftPath: StringGetterType;
  getPath: StringGetterType;
  getStickersPath: StringGetterType;
  getTempPath: StringGetterType;
  getUpdateCachePath: StringGetterType;

  createDeleter: (root: string) => (relativePath: string) => Promise<void>;

  createReader: (root: string) => (relativePath: string) => Promise<Uint8Array>;
  getRelativePath: (name: string) => string;
  createName: (suffix?: string) => string;

  copyIntoAttachmentsDirectory: (
    root: string
  ) => (sourcePath: string) => Promise<{ path: string; size: number }>;

  createWriterForNew: (
    root: string,
    suffix?: string
  ) => (bytes: Uint8Array) => Promise<string>;

  createWriterForExisting: (
    root: string
  ) => (options: { data?: Uint8Array; path?: string }) => Promise<string>;

  createAbsolutePathGetter: (
    rootPath: string
  ) => (relativePath: string) => string;

  createDoesExist: (root: string) => (relativePath: string) => Promise<boolean>;
  saveAttachmentToDisk: ({
    data,
    name,
  }: {
    data: Uint8Array;
    name: string;
  }) => Promise<null | { fullPath: string; name: string }>;
};

/*

  Based on `setup` in `ts/signal.ts` but with some of the implmentations replaced.

*/
export const setup = (options: {
  Attachments: AttachmentsModuleType;
  getRegionCode: () => string | undefined;
  logger: LoggerType;
  userDataPath: string;
}): SignalCoreType => {
  const newVersionTwoGroupId = () =>
    toBase64(deriveGroupFields(getRandomBytes(Groups.ID_LENGTH)).id);

  const newVersionTwoGroupMasterKey = () =>
    toBase64(getRandomBytes(Groups.ID_LENGTH));

  const yesterday = unixTimestamp(moment().subtract(3, 'days').toDate());

  const fergussonSlt: ConversationAttributesType = {
    serviceId: 'PNI:7300202f-1657-40be-b7a2-dff80f9b9ffb' as PniString,
    unreadCount: 2,
    verified: 1,
    messageCount: 236,
    sentMessageCount: 43,
    id: newVersionTwoGroupId(),
    groupId: 'P+4GA58PmF0GJHpMsZTCZZ6VDFBlLaYT43TfMmk2DM4=',
    type: 'group',
    version: 2,
    groupVersion: 2,
    masterKey: newVersionTwoGroupMasterKey(),
    secretParams: 'secretParams',
    publicParams: 'publicParams',
    sealedSender: 0,
    color: 'A200',
    hideStory: false,
    isArchived: false,
    markedUnread: false,
    dontNotifyForMentionsIfMuted: false,
    storySendMode: StorySendMode.IfActive,
    muteExpiresAt: 0,
    messageRequestResponseType: 1,
    profileSharing: true,
    revision: 10,
    name: 'Fergusson SLT',
    expireTimer: DurationInSeconds.fromSeconds(0),
    accessControl: { attributes: 2, members: 2, addFromInviteLink: 4 },
    left: false,
    membersV2: [
      {
        aci: contacts.cath.serviceId as AciString,
        approvedByAdmin: true,
        joinedAtVersion: 1,
        role: MemberRoleEnum.ADMINISTRATOR,
      },
      {
        aci: contacts.christina.serviceId as AciString,
        approvedByAdmin: true,
        joinedAtVersion: 1,
        role: MemberRoleEnum.DEFAULT,
      },
      {
        aci: contacts.dave.serviceId as AciString,
        approvedByAdmin: true,
        joinedAtVersion: 1,
        role: MemberRoleEnum.DEFAULT,
      },
    ],
    description: 'Incorrect spelling on purpose',
    announcementsOnly: false,
    active_at: yesterday,
    lastMessage: "What does Guy's shirt say? Save Eminem?",
    lastMessageStatus: 'read',
    timestamp: yesterday,
    unreadMentionsCount: 0,
    lastMessageBodyRanges: [],
    lastMessageAuthor: 'You',
    lastMessageReceivedAt: yesterday,
    lastMessageReceivedAtMs: yesterday,
    draft: '',
    draftBodyRanges: [],
    draftChanged: true,
  };

  const conversationController = new DevNullConversationController(
    contacts.me,
    [
      contacts.me,
      contacts.cath,
      contacts.christina,
      contacts.dave,
      fergussonSlt,
    ]
  );

  const startConversationController = () => start(conversationController);

  const data = new DevNullClientInterface(
    new DevNullMessages(
      {
        timestamp: minutesAgo(30),
        id: getGuid(),
        conversationId: fergussonSlt.id,
        received_at: minutesAgo(30),
        sendStateByConversationId: {
          [fergussonSlt.id]: { status: SendStatus.Delivered },
        },
        sent_at: minutesAgo(5),
        serverTimestamp: minutesAgo(5),
        sourceServiceId: contacts.dave.serviceId,
        type: 'incoming',
        body: 'No only a month old. From the Phoenix game.',
      },
      {
        timestamp: minutesAgo(10),
        id: getGuid(),
        conversationId: fergussonSlt.id,
        received_at: minutesAgo(10),
        seenStatus: 0,
        sendStateByConversationId: {
          [fergussonSlt.id]: { status: SendStatus.Pending },
        },
        sent_at: minutesAgo(10),
        serverTimestamp: minutesAgo(10),
        sourceServiceId: contacts.cath.serviceId,
        type: 'incoming',
        body: 'Test from Cath',
      },
      {
        timestamp: minutesAgo(10),
        id: getGuid(),
        conversationId: fergussonSlt.id,
        received_at: 20,
        seenStatus: 0,
        sendStateByConversationId: {
          [fergussonSlt.id]: { status: SendStatus.Read },
        },
        sent_at: minutesAgo(10),
        serverTimestamp: minutesAgo(10),
        sourceServiceId: contacts.christina.serviceId,
        type: 'incoming',
        body: 'Nice one',
      },
      {
        timestamp: minutesAgo(10),
        id: getGuid(),
        conversationId: contacts.cath.id,
        received_at: 20,
        seenStatus: 0,
        sendStateByConversationId: {
          [contacts.cath.id]: { status: SendStatus.Read },
        },
        sent_at: minutesAgo(1),
        serverTimestamp: minutesAgo(1),
        source: contacts.me.serviceId,
        sourceDevice: 1,
        type: 'outgoing',
        body: "Hey your hay's here ",
      }
    )
  );

  const ports: Ports = newPorts()
    .with({
      data,
      conversationController,
    })
    .build();

  const { Attachments, getRegionCode, logger, userDataPath } = options;

  const Migrations = initializeMigrations({
    getRegionCode,
    Attachments,
    Type: TypesAttachment,
    VisualType: VisualAttachment,
    logger,
    userDataPath,
  });

  const Components = {
    ConfirmationDialog,
  };

  const Roots = {
    createApp,
    createSafetyNumberViewer,
  };

  const Services = {
    backups: backupsService,
    calling: new DevNullCalling(),
    initializeGroupCredentialFetcher: DevNullInitializeGroupCredentialFetcher,
    initializeNetworkObserver,
    initializeUpdateListener,

    // Testing
    storage,
  };

  const State = {
    Roots,
  };

  const Types = {
    Message: MessageType,

    // Mostly for debugging
    Address,
    QualifiedAddress,
  };

  return {
    Components,
    Crypto,
    Curve,
    // Note: used in test/index.html, and not type-checked!
    conversationControllerStart: startConversationController,
    Data: ports.data ? ports.data : Data,
    Groups,
    Migrations,
    OS,
    RemoteConfig: ports.remoteConfig,
    Services,
    State,
    Types,
    init: async () => {
      await markDone();
      startConversationController();
    },
  };
};

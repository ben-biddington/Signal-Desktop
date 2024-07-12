/* eslint-disable max-len */
// Copyright 2018 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import * as Crypto from '../Crypto';
import * as Curve from '../Curve';
import Data from '../sql/Client';
import * as Groups from '../groups';

import { toBase64 } from '../Bytes';
import { getRandomBytes } from '../Crypto';
import { DevNullClientInterface } from '../ports/DevNullClientInterface';
import { createMessage, DevNullMessages } from '../ports/DevNullMessages';
import type { Ports } from '../ports/ports';
import { newPorts } from '../ports/ports';
import { initializeMigrations } from '../signal';
import type { LoggerType } from '../types/Logging';
import type { PniString } from '../types/ServiceId';
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
import { calling } from '../services/calling';
import { initializeGroupCredentialFetcher } from '../services/groupCredentialFetcher';
import { initializeNetworkObserver } from '../services/networkObserver';
import { initializeUpdateListener } from '../services/updateListener';
import { createSafetyNumberViewer } from '../state/roots/createSafetyNumberViewer';
import OS from '../util/os/osMain';
import { markDone } from '../util/registration';
import * as storage from '../services/storage';

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
  const groupVersion = 2;

  const newVersionTwoGroupId = () =>
    toBase64(deriveGroupFields(getRandomBytes(Groups.ID_LENGTH)).id);

  const newVersionTwoGroupMasterKey = () =>
    toBase64(getRandomBytes(Groups.ID_LENGTH));

  const createNewGroup = () => ({
    groupId: newVersionTwoGroupId(),
    groupVersion,
    masterKey: newVersionTwoGroupMasterKey(),
  });

  /**
   
    @todo: using type: 'private' causes error:

    {
      id: '78482982-a260-4d0a-a55a-90f8e2a01f26',
      type: 'private',
      ...createNewGroup(),
      version: 0,
      addedBy: 'dc4098ad-dd0f-4250-a05b-796716d2b838',
      description: 'Conversation 1',
      members: ['dc4098ad-dd0f-4250-a05b-796716d2b838'],
      name: 'Note to self',
      serviceId: 'PNI:c9023f3a-bbca-4242-8306-475677c0a5ca' as PniString,
    },

    Uncaught (in promise) Error: Conversation.format()/PNI:dc46c18a-39eb-4251-be05-d00c00e605f2 (cfcdd0fa-ca11-4044-b282-e69d98107f40) reentrant call, no old cached props!
      at ConversationModel.format (VM113 preload.bundle.js:310150:19)
      at VM113 preload.bundle.js:308247:211
      at Array.map (<anonymous>)
      at getConversation (VM113 preload.bundle.js:308247:149)
      at ConversationModel.format (VM113 preload.bundle.js:310162:34)
      at VM113 preload.bundle.js:316013:36
      at arrayMap (VM113 preload.bundle.js:523:27)
      at Function.map (VM113 preload.bundle.js:4101:18)
      at Backbone3.Collection.map (VM113 preload.bundle.js:69387:34)
      at getInitialState (VM113 preload.bundle.js:316012:50)
      format @ VM113 preload.bundle.js:310150
      (anonymous) @ VM113 preload.bundle.js:308247
      getConversation @ VM113 preload.bundle.js:308247
      format @ VM113 preload.bundle.js:310162
      (anonymous) @ VM113 preload.bundle.js:316013
      arrayMap @ VM113 preload.bundle.js:523
      map @ VM113 preload.bundle.js:4101
      (anonymous) @ VM113 preload.bundle.js:69387
      getInitialState @ VM113 preload.bundle.js:316012
      initializeRedux @ VM113 preload.bundle.js:316156
      setupAppState @ VM113 preload.bundle.js:318095
      (anonymous) @ VM113 preload.bundle.js:318065
      await in (anonymous) (async)
      (anonymous) @ VM113 preload.bundle.js:302566
      callListeners @ VM113 preload.bundle.js:302566
      fetch @ VM113 preload.bundle.js:302557
      startApp @ VM113 preload.bundle.js:318089
      await in startApp (async)
      (anonymous) @ background.html:119
  */

  const conversationController = new DevNullConversationController(
    {
      id: '78482982-a260-4d0a-a55a-90f8e2a01f26',
      type: 'group',
      ...createNewGroup(),
      version: 0,
      addedBy: 'dc4098ad-dd0f-4250-a05b-796716d2b838',
      description: 'Conversation 1',
      members: ['dc4098ad-dd0f-4250-a05b-796716d2b838'],
      name: 'Conversation 1',
      serviceId: 'PNI:c9023f3a-bbca-4242-8306-475677c0a5ca' as PniString,
    },
    {
      id: 'de982c0a-cf3c-433e-b25c-e3315bd290e6',
      type: 'group',
      ...createNewGroup(),
      version: 0,
      addedBy: 'dc4098ad-dd0f-4250-a05b-796716d2b838',
      description: 'Conversation 2',
      members: [
        'dc4098ad-dd0f-4250-a05b-796716d2b838',
        'f90f61cd-ec82-478e-a9da-a10c2cd75b8d',
        '3f8b7839-d49a-4e63-8444-25508ea9418f',
      ],
      name: 'Conversation 2',
      serviceId: 'PNI:9b58a16e-699a-4d62-ad95-24ec0c5985ec' as PniString,
    },
    {
      id: '5ab1a933-9d2d-4a9a-887f-9f696398931b',
      type: 'group',
      ...createNewGroup(),
      version: 0,
      addedBy: 'dc4098ad-dd0f-4250-a05b-796716d2b838',
      description: 'Conversation 2',
      members: [
        'dc4098ad-dd0f-4250-a05b-796716d2b838',
        'f90f61cd-ec82-478e-a9da-a10c2cd75b8d',
        '3f8b7839-d49a-4e63-8444-25508ea9418f',
      ],
      name: 'Conversation 3',
      serviceId: 'PNI:7d83b820-3104-46d2-96d9-bf6e88c860e4' as PniString,
    }
  );

  const startConversationController = () => start(conversationController);

  const data = new DevNullClientInterface(
    new DevNullMessages(
      createMessage({
        id: 'msg-1',
        conversationId: '78482982-a260-4d0a-a55a-90f8e2a01f26',
        message: 'A B C',
      }),
      createMessage({
        id: 'msg-2',
        conversationId: '78482982-a260-4d0a-a55a-90f8e2a01f26',
        message: 'D E F',
      }),
      createMessage({
        id: 'msg-3',
        conversationId: '78482982-a260-4d0a-a55a-90f8e2a01f26',
        message: 'G H I',
        contact: [
          {
            serviceId: 'PNI:dc46c18a-39eb-4251-be05-d00c00e605f2' as PniString,
          },
          {
            serviceId: 'PNI:f90f61cd-ec82-478e-a9da-a10c2cd75b8d' as PniString,
          },
        ],
      })
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
    calling,
    initializeGroupCredentialFetcher,
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

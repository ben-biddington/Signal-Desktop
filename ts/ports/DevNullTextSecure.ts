import type { TextSecureType } from '../textsecure';
import EventTarget from '../textsecure/EventTarget';
import utils from '../textsecure/Helpers';
import MessageReceiver from '../textsecure/MessageReceiver';
import SyncRequest from '../textsecure/SyncRequest';
import * as WebAPI from '../textsecure/WebAPI';
import WebSocketResource from '../textsecure/WebsocketResources';
import { DevNullAccountManager } from './DevNullAccountManager';
import { DevNullMessageSender } from './DevNullMessageSender';
import { DevNullStorage } from './DevNullStorage';

export const create = (): TextSecureType => {
  return {
    utils,
    storage: new DevNullStorage(),
    AccountManager: new DevNullAccountManager(),
    EventTarget,
    MessageReceiver,
    MessageSender: new DevNullMessageSender(),
    SyncRequest,
    WebAPI,
    WebSocketResource,
    messaging: new DevNullMessageSender(),
  };
};

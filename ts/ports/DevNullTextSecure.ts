import type { TextSecureType } from '../textsecure';
import AccountManager from '../textsecure/AccountManager';
import EventTarget from '../textsecure/EventTarget';
import utils from '../textsecure/Helpers';
import MessageReceiver from '../textsecure/MessageReceiver';
import MessageSender from '../textsecure/SendMessage';
import SyncRequest from '../textsecure/SyncRequest';
import * as WebAPI from '../textsecure/WebAPI';
import WebSocketResource from '../textsecure/WebsocketResources';
import { DevNullStorage } from './DevNullStorage';

export const create = (): TextSecureType => {
  return {
    utils,
    storage: new DevNullStorage(),
    AccountManager,
    EventTarget,
    MessageReceiver,
    MessageSender,
    SyncRequest,
    WebAPI,
    WebSocketResource,
  };
};

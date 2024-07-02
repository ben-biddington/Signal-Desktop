/* eslint-disable no-console */

import type { EventHandler } from '../textsecure/EventTarget';
import type {
  CallEventSyncEvent,
  EmptyEvent,
  EnvelopeQueuedEvent,
  EnvelopeUnsealedEvent,
  ProgressEvent,
  TypingEvent,
  ErrorEvent,
  DeliveryEvent,
  DecryptionErrorEvent,
  SentEvent,
  ProfileKeyUpdateEvent,
  InvalidPlaintextEvent,
  MessageEvent,
  RetryRequestEvent,
  ReadEvent,
  ViewEvent,
  ConfigurationEvent,
  ViewOnceOpenSyncEvent,
  MessageRequestResponseEvent,
  FetchLatestEvent,
  KeysEvent,
  StickerPackEvent,
  ReadSyncEvent,
  ViewSyncEvent,
  ContactSyncEvent,
  StoryRecipientUpdateEvent,
  CallLogEventSyncEvent,
  CallLinkUpdateSyncEvent,
  DeleteForMeSyncEvent,
} from '../textsecure/messageReceiverEvents';
import type { IRequestHandler } from '../textsecure/Types';
import type { IncomingWebSocketRequest } from '../textsecure/WebsocketResources';
import EventTarget from '../textsecure/EventTarget';

export class EventTargetMessageReceiver
  extends EventTarget
  implements IRequestHandler
{
  handleRequest(request: IncomingWebSocketRequest): void {
    console.log('[DevNullMessageReceiver]', { request });
  }

  public override addEventListener(
    name: 'empty',
    handler: (ev: EmptyEvent) => void
  ): void;

  public override addEventListener(
    name: 'progress',
    handler: (ev: ProgressEvent) => void
  ): void;

  public override addEventListener(
    name: 'typing',
    handler: (ev: TypingEvent) => void
  ): void;

  public override addEventListener(
    name: 'error',
    handler: (ev: ErrorEvent) => void
  ): void;

  public override addEventListener(
    name: 'delivery',
    handler: (ev: DeliveryEvent) => void
  ): void;

  public override addEventListener(
    name: 'decryption-error',
    handler: (ev: DecryptionErrorEvent) => void
  ): void;

  public override addEventListener(
    name: 'invalid-plaintext',
    handler: (ev: InvalidPlaintextEvent) => void
  ): void;

  public override addEventListener(
    name: 'sent',
    handler: (ev: SentEvent) => void
  ): void;

  public override addEventListener(
    name: 'profileKeyUpdate',
    handler: (ev: ProfileKeyUpdateEvent) => void
  ): void;

  public override addEventListener(
    name: 'message',
    handler: (ev: MessageEvent) => void
  ): void;

  public override addEventListener(
    name: 'retry-request',
    handler: (ev: RetryRequestEvent) => void
  ): void;

  public override addEventListener(
    name: 'read',
    handler: (ev: ReadEvent) => void
  ): void;

  public override addEventListener(
    name: 'view',
    handler: (ev: ViewEvent) => void
  ): void;

  public override addEventListener(
    name: 'configuration',
    handler: (ev: ConfigurationEvent) => void
  ): void;

  public override addEventListener(
    name: 'viewOnceOpenSync',
    handler: (ev: ViewOnceOpenSyncEvent) => void
  ): void;

  public override addEventListener(
    name: 'messageRequestResponse',
    handler: (ev: MessageRequestResponseEvent) => void
  ): void;

  public override addEventListener(
    name: 'fetchLatest',
    handler: (ev: FetchLatestEvent) => void
  ): void;

  public override addEventListener(
    name: 'keys',
    handler: (ev: KeysEvent) => void
  ): void;

  public override addEventListener(
    name: 'sticker-pack',
    handler: (ev: StickerPackEvent) => void
  ): void;

  public override addEventListener(
    name: 'readSync',
    handler: (ev: ReadSyncEvent) => void
  ): void;

  public override addEventListener(
    name: 'viewSync',
    handler: (ev: ViewSyncEvent) => void
  ): void;

  public override addEventListener(
    name: 'contactSync',
    handler: (ev: ContactSyncEvent) => void
  ): void;

  public override addEventListener(
    name: 'envelopeQueued',
    handler: (ev: EnvelopeQueuedEvent) => void
  ): void;

  public override addEventListener(
    name: 'envelopeUnsealed',
    handler: (ev: EnvelopeUnsealedEvent) => void
  ): void;

  public override addEventListener(
    name: 'storyRecipientUpdate',
    handler: (ev: StoryRecipientUpdateEvent) => void
  ): void;

  public override addEventListener(
    name: 'callEventSync',
    handler: (ev: CallEventSyncEvent) => void
  ): void;

  public override addEventListener(
    name: 'callLinkUpdateSync',
    handler: (ev: CallLinkUpdateSyncEvent) => void
  ): void;

  public override addEventListener(
    name: 'callLogEventSync',
    handler: (ev: CallLogEventSyncEvent) => void
  ): void;

  public override addEventListener(
    name: 'deleteForMeSync',
    handler: (ev: DeleteForMeSyncEvent) => void
  ): void;

  public override addEventListener(name: string, handler: EventHandler): void {
    return super.addEventListener(name, handler);
  }

  public override removeEventListener(
    name: string,
    handler: EventHandler
  ): void {
    return super.removeEventListener(name, handler);
  }
}

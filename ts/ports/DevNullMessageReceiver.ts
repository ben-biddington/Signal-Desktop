/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-console */

import type { EventHandler } from '../textsecure/EventTarget';
import type {
  CallEventSyncEvent,
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
  StickerPackEvent,
  ReadSyncEvent,
  ViewSyncEvent,
  StoryRecipientUpdateEvent,
  CallLogEventSyncEvent,
  CallLinkUpdateSyncEvent,
  DeleteForMeSyncEvent,
} from '../textsecure/messageReceiverEvents';
import { EmptyEvent } from '../textsecure/messageReceiverEvents';
import * as messageReceiverEvents from '../textsecure/messageReceiverEvents';
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

  constructor() {
    super();

    // Copied from `ts/textsecure/MessageReceiver.ts`
    window.Whisper.events.on('app-ready-for-processing', () => {
      this.dispatchEvent(
        new messageReceiverEvents.KeysEvent(
          {
            masterKey: new Uint8Array(0),
            storageServiceKey: new Uint8Array(0),
          },
          () => {}
        )
      );

      // This is how we populate contacts, see `mock` in `ts/signal.ts`.
      this.dispatchEvent(
        new messageReceiverEvents.ContactSyncEvent(
          [
            {
              name: 'Ben',
              aci: 'dc4098ad-dd0f-4250-a05b-796716d2b838',
              number: '+64220170045',
            },
            {
              name: 'Derwood',
              aci: 'f90f61cd-ec82-478e-a9da-a10c2cd75b8d',
              number: '+64220170046',
            },
            {
              name: 'Sally',
              aci: '3f8b7839-d49a-4e63-8444-25508ea9418f',
              number: '+64220170047',
            },
            {
              name: 'Gorflaxus',
              aci: 'dcd936c5-eeda-48c7-bea1-0a84cf33e977',
              number: '+64220170048',
            },
          ],
          true,
          new Date().getTime(),
          new Date().getTime()
        )
      );

      this.dispatchEvent(new EmptyEvent());
    });
  }

  // region Taken from `MessageReceiver`

  public stopProcessing(): void {}

  public getAndResetProcessedCount(): number {
    return 0;
  }

  public reset(): void {}

  public hasEmptied(): boolean {
    return false;
  }

  public async drain(): Promise<void> {
    return Promise.resolve();
  }

  // endregion Taken from `MessageReceiver`

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
    handler: (ev: messageReceiverEvents.KeysEvent) => void
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
    handler: (ev: messageReceiverEvents.ContactSyncEvent) => void
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

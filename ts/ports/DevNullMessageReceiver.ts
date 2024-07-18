/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-console */

// eslint-disable-next-line max-classes-per-file
import moment from 'moment';
import { v4 as getGuid } from 'uuid';
import { EmptyEvent } from '../textsecure/messageReceiverEvents';
import * as messageReceiverEvents from '../textsecure/messageReceiverEvents';
import type { IncomingWebSocketRequest } from '../textsecure/WebsocketResources';
import { SignalService as Proto } from '../protobuf';
import { generateAci, type ServiceIdString } from '../types/ServiceId';
import { now, unixTimestamp } from '../adapters/date-time';
import { IMessageReceiver } from './IMessageReceiver';

export class DevNullMessageReceiver extends IMessageReceiver {
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
          unixTimestamp(now()),
          unixTimestamp(now())
        )
      );

      // Show the 'Loading messages from 9 days ago.' message
      const receivedDate: Date = moment().subtract(3, 'days').toDate();

      const timestamp = unixTimestamp(receivedDate);

      this.dispatchEvent(
        new messageReceiverEvents.EnvelopeUnsealedEvent({
          id: getGuid(),
          receivedAtCounter: 0,
          receivedAtDate: receivedDate.getTime(),
          messageAgeSec: moment().diff(receivedDate),
          sourceServiceId: generateAci(),
          destinationServiceId: '' as ServiceIdString,
          timestamp,
          serverGuid: getGuid(),
          serverTimestamp: timestamp,
          type: Proto.Envelope.Type.UNKNOWN,
        })
      );

      this.dispatchEvent(
        new messageReceiverEvents.EnvelopeQueuedEvent({
          id: getGuid(),
          receivedAtCounter: 0,
          receivedAtDate: receivedDate.getTime(),
          messageAgeSec: moment().diff(receivedDate),
          sourceServiceId: generateAci(),
          destinationServiceId: '' as ServiceIdString,
          timestamp,
          serverGuid: getGuid(),
          serverTimestamp: receivedDate.getTime(),
          type: Proto.Envelope.Type.UNKNOWN,
        })
      );

      // See `onEmpty` in `ts/background.ts`
      // [!] make sure this is last because it sets 'hasInitialLoadCompleted'.
      const onload = setTimeout(() => {
        clearTimeout(onload);
        this.dispatchEvent(new EmptyEvent());
      }, 5000);
    });
  }

  public getAndResetProcessedCount = (): number => 0;
  public reset = (): void => {};
  public stopProcessing = (): void => {};
  public override hasEmptied = (): boolean => false;
  public override drain = (): Promise<void> => Promise.resolve();
  public handleRequest(request: IncomingWebSocketRequest): void {
    console.log('[DevNullMessageReceiver]', { request });
  }
}

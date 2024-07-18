/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import type {
  ClientSearchResultMessageType,
  MessageType,
} from '../sql/Interface';
import type { ServiceIdString } from '../types/ServiceId';

const emptyMessage = (): MessageType => {
  const now = new Date().getDate();

  return {
    id: '',
    sent_at: now,
    type: 'incoming',
    conversationId: '',
    timestamp: now,
    received_at: now,
    bodyRanges: [],
    body: '',
  };
};

export const createMessage = (
  attributes: Partial<MessageType>
): MessageType => ({
  ...emptyMessage(),
  ...attributes,
});

export class DevNullMessages {
  private readonly messages: Array<MessageType> = [];

  constructor(...messages: Array<MessageType>) {
    this.messages = messages;
  }

  getMessageById = (id: string): Promise<MessageType | undefined> => {
    const result = this.messages.find(it => it.id === id);
    console.log('DevNullMessages', { result });
    return Promise.resolve(result);
  };

  searchMessages = (_: {
    query: string;
    conversationId?: string;
    options?: { limit?: number };
    contactServiceIdsMatchingQuery?: Array<ServiceIdString>;
  }): Promise<Array<ClientSearchResultMessageType>> => {
    return Promise.resolve(
      this.messages.map(m => ({
        id: m.id,
        sent_at: m.sent_at,
        conversationId: m.conversationId,
        timestamp: m.timestamp,
        received_at: m.received_at,
        type: m.type,
        json: JSON.stringify(m.body),
        text: m.body,
        body: m.body,
        bodyRanges: [],
        snippet: m.body?.substring(0, 5) || '',
      }))
    );
  };
}

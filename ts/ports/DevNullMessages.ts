import { unixTimestamp, now } from '../adapters/date-time';
import type { MessageAttributesType } from '../model-types';
import type {
  ClientSearchResultMessageType,
  MessageType,
} from '../sql/Interface';
import type { ServiceIdString } from '../types/ServiceId';

const emptyMessage = (): MessageType => {
  const _now = unixTimestamp(now());
  return {
    id: '',
    sent_at: _now,
    type: 'incoming',
    conversationId: '',
    timestamp: _now,
    received_at: _now,
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

  public add = (m: MessageType): void => {
    this.messages.push(m);
  };

  getMessageById = (id: string): Promise<MessageType | undefined> => {
    return Promise.resolve(this.messages.find(it => it.id === id));
  };

  findMessagesForConversation = (
    conversationId: string
  ): Promise<Array<MessageType>> =>
    Promise.resolve(
      this.messages.filter(it => it.conversationId === conversationId)
    );

  searchMessages = (_: {
    query: string;
    conversationId?: string;
    options?: { limit?: number };
    contactServiceIdsMatchingQuery?: Array<ServiceIdString>;
  }): Promise<Array<ClientSearchResultMessageType>> => {
    return Promise.resolve(this.map(this.messages));
  };

  private map = (
    messages: Array<MessageAttributesType>
  ): Array<ClientSearchResultMessageType> =>
    messages.map(m => ({
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
      contact: m.contact,
      message: m.message,
    }));
}

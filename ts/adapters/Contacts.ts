/* eslint-disable no-console */
import moment from 'moment';
import type { ConversationAttributesType } from '../model-types';
import {
  type ServiceIdString,
  generatePni,
  generateAci,
} from '../types/ServiceId';
import { minutesAgo, unixTimestamp } from './date-time';

const yesterday = unixTimestamp(moment().subtract(3, 'days').toDate());
const lastWeek = unixTimestamp(moment().subtract(1, 'week').toDate());

/*

  Single sample contact list

*/
class Contacts {
  private readonly contacts: Record<string, ConversationAttributesType> = {};

  constructor() {
    const id = generateAci();
    const pni = generatePni();
    const serviceId = 'cf90bda2-d61d-41b6-9305-c983064c114c' as ServiceIdString; // [!] Why does `generateAci()` not work?

    this.contacts.me = {
      unreadCount: 0,
      verified: 1,
      messageCount: 13,
      sentMessageCount: 4,
      id,
      description: `id="${id}" serviceId="${serviceId}" pni="${pni}"`,
      serviceId,
      type: 'private',
      version: 2,
      pni,
      sealedSender: 1,
      color: 'A110',
      profileName: 'Ben',
      profileFamilyName: 'Biddington',
      systemGivenName: 'Ben',
      systemFamilyName: 'Biddington',
      messageRequestResponseType: 1,
      profileSharing: true,
      hideStory: false,
      isArchived: false,
      markedUnread: false,
      muteExpiresAt: 0,
      sharingPhoneNumber: false,
      name: 'Ben Biddington',
      inbox_position: 1,
      active_at: lastWeek,
      unreadMentionsCount: 0,
      lastMessageReceivedAt: minutesAgo(10),
      timestamp: minutesAgo(10),
    };

    this.contacts.dave = {
      unreadCount: 0,
      verified: 1,
      messageCount: 13,
      sentMessageCount: 4,
      id: generateAci(),
      serviceId: 'afb6c681-8d2e-445b-b379-802565c627a9' as ServiceIdString, // [!] Why does `generateAci()` not work?
      type: 'private',
      version: 2,
      pni: generatePni(),
      sealedSender: 1,
      color: 'A110',
      profileName: 'David',
      profileFamilyName: 'Ward',
      systemGivenName: 'David',
      systemFamilyName: 'Ward',
      messageRequestResponseType: 1,
      profileSharing: true,
      hideStory: false,
      isArchived: false,
      markedUnread: false,
      muteExpiresAt: 0,
      sharingPhoneNumber: false,
      name: 'David Ward',
      inbox_position: 1,
      active_at: lastWeek,
      unreadMentionsCount: 0,
      lastMessage: '...',
      lastMessageReceivedAt: minutesAgo(10),
      timestamp: minutesAgo(10),
    };

    this.contacts.christina = {
      verified: 1,
      id: generateAci(),
      serviceId: 'a37738b9-78f4-4c8c-aeb3-ac3880682bbd' as ServiceIdString,
      type: 'private',
      version: 2,
      pni: generatePni(),
      sealedSender: 1,
      color: 'A110',
      profileName: 'Christina',
      profileFamilyName: 'Ward',
      systemGivenName: 'Christina',
      systemFamilyName: 'Ward',
      messageRequestResponseType: 1,
      profileSharing: true,
      name: 'Christina Ward',
      active_at: lastWeek,
      lastMessage: 'Crikey!',
      lastMessageAuthor: 'Christina',
      lastMessageReceivedAt: lastWeek,
      lastMessageReceivedAtMs: lastWeek,
      timestamp: lastWeek,
    };

    this.contacts.cath = {
      unreadCount: 7,
      verified: 1,
      messageCount: 113,
      sentMessageCount: 41,
      id: generateAci(),
      serviceId: '1d8adee7-3e2d-4fc7-80c8-30ed8f4488cd' as ServiceIdString,
      type: 'private',
      version: 2,
      pni: generatePni(),
      sealedSender: 1,
      color: 'A150',
      profileName: 'Cat',
      systemGivenName: 'Catherine',
      systemFamilyName: 'Wilson',
      nicknameGivenName: 'Cath',
      nicknameFamilyName: '',
      messageRequestResponseType: 1,
      profileSharing: true,
      hideStory: false,
      isArchived: false,
      markedUnread: false,
      muteExpiresAt: 0,
      about: '',
      aboutEmoji: '',
      sharingPhoneNumber: false,
      name: 'Catherine Wilson',
      inbox_position: 1,
      active_at: yesterday,
      unreadMentionsCount: 10,
      lastMessage: '...',
      lastMessageBodyRanges: [],
      lastMessageAuthor: 'Catherine',
      lastMessageStatus: null,
      lastMessageReceivedAt: yesterday,
      lastMessageReceivedAtMs: yesterday,
      timestamp: yesterday,
    };
  }

  get me(): ConversationAttributesType {
    return this.contacts.me;
  }

  get dave(): ConversationAttributesType {
    return this.contacts.dave;
  }

  get christina(): ConversationAttributesType {
    return this.contacts.christina;
  }

  get cath(): ConversationAttributesType {
    return this.contacts.cath;
  }
}

// [!] We want this to be static so that everyone sees identical data
export const contacts = new Contacts();

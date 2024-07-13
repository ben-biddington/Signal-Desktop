import moment from 'moment';

export const unixTimestamp = (date: Date): number =>
  Math.floor(date.getTime() / 1000);

export const now = (): Date => moment().toDate();

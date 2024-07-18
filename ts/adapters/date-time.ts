import moment from 'moment';

export const unixTimestamp = (date: Date): number =>
  Math.floor(date.getTime() / 1000);

export const now = (): Date => moment().toDate();

export type UnixTimestamp = number;

export const minutesAgo = (n: number): UnixTimestamp =>
  unixTimestamp(moment().subtract(n, 'minutes').toDate());

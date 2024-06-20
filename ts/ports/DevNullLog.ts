import type { LoggerType } from '../types/Logging';

export class DevNullLog implements LoggerType {
  fatal = () => {};
  error = () => {};
  warn = () => {};
  info = () => {};
  debug = () => {};
  trace = () => {};
}

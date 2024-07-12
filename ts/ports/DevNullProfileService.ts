/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IProfileService } from './IProfileService';

export class DevNullProfileService implements IProfileService {
  get = (conversationId: string): Promise<void> => Promise.resolve();
  clearAll = (reason: string): void => {};
  pause = (timeInMS: number): Promise<void> => Promise.resolve();
}

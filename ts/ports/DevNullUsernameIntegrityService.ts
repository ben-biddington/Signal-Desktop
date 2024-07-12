import type { IUsernameIntegrityService } from './IUsernameIntegrityService';

export class DevNullUsernameIntegrityService
  implements IUsernameIntegrityService
{
  start = (): Promise<void> => Promise.resolve();
}

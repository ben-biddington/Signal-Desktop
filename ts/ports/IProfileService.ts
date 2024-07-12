export type IProfileService = {
  get: (conversationId: string) => Promise<void>;
  clearAll: (reason: string) => void;
  pause: (timeInMS: number) => Promise<void>;
};

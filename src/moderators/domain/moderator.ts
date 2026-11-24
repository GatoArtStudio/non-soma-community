export type ModeratorSource = "manual" | "chat_badge";

export interface Moderator {
  kickUserId: number;
  username: string;
  source: ModeratorSource;
  grantedAt: Date;
  revokedAt: Date | null;
}

export function isActiveModerator(moderator: Moderator | null): boolean {
  return moderator !== null && moderator.revokedAt === null;
}

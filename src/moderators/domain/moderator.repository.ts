import type { Moderator, ModeratorSource } from "./moderator";

export interface ModeratorRepository {
  findByKickUserId(kickUserId: number): Promise<Moderator | null>;
  list(): Promise<Moderator[]>;
  /** Inserts the moderator or reactivates it when it already exists. */
  grant(input: {
    kickUserId: number;
    username: string;
    source: ModeratorSource;
    grantedByUserId: number | null;
  }): Promise<void>;
  updateUsername(kickUserId: number, username: string): Promise<void>;
  revoke(kickUserId: number, revokedByUserId: number): Promise<void>;
}

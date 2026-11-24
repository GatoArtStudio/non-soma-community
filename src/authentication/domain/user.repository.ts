import type { KickIdentity, SessionUser } from "./session-user";

export interface UserRepository {
  upsertFromKick(identity: KickIdentity): Promise<SessionUser>;
}

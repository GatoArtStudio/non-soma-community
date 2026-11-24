import "server-only";
import { eq } from "drizzle-orm";
import type { Database } from "@/shared/db/client";
import type { KickIdentity, SessionUser } from "@/authentication/domain/session-user";
import type { UserRepository } from "@/authentication/domain/user.repository";
import { usersTable } from "./users.table";

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async upsertFromKick(identity: KickIdentity): Promise<SessionUser> {
    await this.db
      .insert(usersTable)
      .values(identity)
      .onDuplicateKeyUpdate({
        set: { username: identity.username, avatarUrl: identity.avatarUrl },
      });
    const [user] = await this.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.kickUserId, identity.kickUserId))
      .limit(1);
    if (!user) throw new Error("User upsert did not persist");
    return { id: user.id, ...identity };
  }
}

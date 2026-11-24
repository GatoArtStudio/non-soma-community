import { DomainError } from "@/shared/errors/domain-error";
import type { KickChannelDirectory } from "@/moderators/domain/kick-channel.port";
import type { Moderator } from "@/moderators/domain/moderator";
import type { ModeratorRepository } from "@/moderators/domain/moderator.repository";
import type { ModerationLog } from "@/moderation/domain/moderation-log.port";
import { assertCanManageTeam, type Actor } from "@/moderators/domain/staff-member";

export type TeamErrorCode = "kick_account_not_found" | "cannot_target_owner" | "invalid_username";

const KICK_SLUG_PATTERN = /^[a-zA-Z0-9_-]{2,25}$/;

export function createManageTeam(deps: {
  channel: KickChannelDirectory;
  moderators: ModeratorRepository;
  log: ModerationLog;
}) {
  async function listModerators(actor: Actor): Promise<Moderator[]> {
    assertCanManageTeam(actor);
    return deps.moderators.list();
  }

  async function grantModerator(actor: Actor, rawUsername: string): Promise<Moderator> {
    assertCanManageTeam(actor);
    const slug = rawUsername.trim().replace(/^@/, "").toLowerCase();
    if (!KICK_SLUG_PATTERN.test(slug)) throw new DomainError<TeamErrorCode>("invalid_username");

    const account = await deps.channel.findAccountBySlug(slug);
    if (!account) throw new DomainError<TeamErrorCode>("kick_account_not_found");
    if (account.kickUserId === (await deps.channel.getBroadcasterUserId())) {
      throw new DomainError<TeamErrorCode>("cannot_target_owner");
    }

    await deps.moderators.grant({
      kickUserId: account.kickUserId,
      username: account.username,
      source: "manual",
      grantedByUserId: actor.userId,
    });
    const moderator = await deps.moderators.findByKickUserId(account.kickUserId);
    if (!moderator) throw new Error("Moderator was not persisted");
    await deps.log.record({
      actorUserId: actor.userId,
      action: "grant_moderator",
      targetKickUserId: account.kickUserId,
      detail: account.username,
    });
    return moderator;
  }

  async function revokeModerator(actor: Actor, kickUserId: number): Promise<void> {
    assertCanManageTeam(actor);
    if (kickUserId === (await deps.channel.getBroadcasterUserId())) {
      throw new DomainError<TeamErrorCode>("cannot_target_owner");
    }
    await deps.moderators.revoke(kickUserId, actor.userId);
    await deps.log.record({
      actorUserId: actor.userId,
      action: "revoke_moderator",
      targetKickUserId: kickUserId,
    });
  }

  async function restoreModerator(actor: Actor, kickUserId: number): Promise<void> {
    assertCanManageTeam(actor);
    const existing = await deps.moderators.findByKickUserId(kickUserId);
    if (!existing) throw new DomainError<TeamErrorCode>("kick_account_not_found");
    await deps.moderators.grant({
      kickUserId,
      username: existing.username,
      source: existing.source,
      grantedByUserId: actor.userId,
    });
    await deps.log.record({
      actorUserId: actor.userId,
      action: "restore_moderator",
      targetKickUserId: kickUserId,
      detail: existing.username,
    });
  }

  return { listModerators, grantModerator, revokeModerator, restoreModerator };
}

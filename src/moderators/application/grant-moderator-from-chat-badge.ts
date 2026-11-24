import type { ModeratorRepository } from "@/moderators/domain/moderator.repository";

export type ChatBadgeGrantOutcome = "granted" | "refreshed" | "revoked_by_owner";

/**
 * Kick has no API to list channel moderators, so a moderator badge seen in chat is
 * the signal. Revocations made by the owner always win over the badge.
 */
export function createGrantModeratorFromChatBadge(deps: { moderators: ModeratorRepository }) {
  return async function grantModeratorFromChatBadge(input: {
    kickUserId: number;
    username: string;
  }): Promise<ChatBadgeGrantOutcome> {
    const existing = await deps.moderators.findByKickUserId(input.kickUserId);
    if (existing?.revokedAt) return "revoked_by_owner";
    if (existing) {
      if (existing.username !== input.username) {
        await deps.moderators.updateUsername(input.kickUserId, input.username);
      }
      return "refreshed";
    }
    await deps.moderators.grant({
      kickUserId: input.kickUserId,
      username: input.username,
      source: "chat_badge",
      grantedByUserId: null,
    });
    return "granted";
  };
}

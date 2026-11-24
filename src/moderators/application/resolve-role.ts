import type { KickChannelDirectory } from "@/moderators/domain/kick-channel.port";
import { isActiveModerator } from "@/moderators/domain/moderator";
import type { ModeratorRepository } from "@/moderators/domain/moderator.repository";
import type { Role } from "@/moderators/domain/role";

export function createResolveRole(deps: {
  channel: KickChannelDirectory;
  moderators: ModeratorRepository;
}) {
  return async function resolveRole(kickUserId: number): Promise<Role> {
    // If Kick is unreachable the owner temporarily resolves as a regular user instead of failing the page.
    const broadcasterUserId = await deps.channel.getBroadcasterUserId().catch(() => null);
    if (kickUserId === broadcasterUserId) return "owner";
    const moderator = await deps.moderators.findByKickUserId(kickUserId);
    return isActiveModerator(moderator) ? "moderator" : "member";
  };
}

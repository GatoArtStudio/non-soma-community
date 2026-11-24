import "server-only";
import { getEnv } from "@/shared/config/env";
import { getDb } from "@/shared/db/client";
import { getKickApiClient } from "@/kick-platform/kick-platform";
import { getModerationLog } from "@/moderation/container";
import { createGrantModeratorFromChatBadge } from "./application/grant-moderator-from-chat-badge";
import { createManageTeam } from "./application/manage-team";
import { createResolveRole } from "./application/resolve-role";
import { DrizzleModeratorRepository } from "./infrastructure/drizzle-moderator.repository";
import { KickApiChannelDirectory } from "./infrastructure/kick-channel.directory";

export function getKickChannelDirectory() {
  return new KickApiChannelDirectory(getKickApiClient(), getEnv().KICK_CHANNEL_SLUG);
}

function getModeratorRepository() {
  return new DrizzleModeratorRepository(getDb());
}

export function getResolveRole() {
  return createResolveRole({
    channel: getKickChannelDirectory(),
    moderators: getModeratorRepository(),
  });
}

export function getGrantModeratorFromChatBadge() {
  return createGrantModeratorFromChatBadge({ moderators: getModeratorRepository() });
}

export function getManageTeam() {
  return createManageTeam({
    channel: getKickChannelDirectory(),
    moderators: getModeratorRepository(),
    log: getModerationLog(),
  });
}

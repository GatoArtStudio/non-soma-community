import "server-only";
import { getDb } from "@/shared/db/client";
import { getKickApiClient } from "@/kick-platform/kick-platform";
import { getGrantModeratorFromChatBadge, getKickChannelDirectory } from "@/moderators/container";
import { createChatSubscription } from "./application/chat-subscription";
import { createHandleKickWebhook } from "./application/handle-kick-webhook";
import { DrizzleProcessedMessageStore } from "./infrastructure/drizzle-processed-message.store";
import { KickApiEventSubscriptions } from "./infrastructure/kick-event.subscriptions";
import { KickSignatureVerifier } from "./infrastructure/kick-signature.verifier";

export function getHandleKickWebhook() {
  return createHandleKickWebhook({
    verifier: new KickSignatureVerifier(getKickApiClient()),
    processedMessages: new DrizzleProcessedMessageStore(getDb()),
    channel: getKickChannelDirectory(),
    grantModeratorFromChatBadge: getGrantModeratorFromChatBadge(),
  });
}

export function getChatSubscription() {
  return createChatSubscription({
    subscriptions: new KickApiEventSubscriptions(getKickApiClient()),
    channel: getKickChannelDirectory(),
  });
}

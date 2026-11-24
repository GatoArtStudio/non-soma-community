import { z } from "zod";
import type { ChatBadgeGrantOutcome } from "@/moderators/application/grant-moderator-from-chat-badge";
import type { KickChannelDirectory } from "@/moderators/domain/kick-channel.port";
import {
  CHAT_MESSAGE_EVENT,
  MAX_DELIVERY_AGE_MS,
  type KickWebhookDelivery,
  type ProcessedMessageStore,
  type WebhookSignatureVerifier,
} from "@/kick-events/domain/kick-webhook";

// Deliberately lenient: only the fields needed to detect moderators are required.
const chatMessageSchema = z.object({
  broadcaster: z.object({ user_id: z.number() }),
  sender: z.object({
    is_anonymous: z.boolean().nullish(),
    user_id: z.number(),
    username: z.string().min(1),
    identity: z
      .object({
        badges: z.array(z.object({ type: z.string().nullish() }).loose()).nullish(),
      })
      .loose()
      .nullish(),
  }),
});

const MODERATOR_BADGE = "moderator";

export type WebhookOutcome =
  | { status: "rejected"; reason: "malformed" | "stale" | "bad_signature" }
  | {
      status: "ignored";
      reason: "duplicate" | "unhandled_event" | "other_channel" | "no_badge";
      senderUsername?: string;
      badges?: string[];
    }
  | { status: "processed"; moderator: ChatBadgeGrantOutcome; senderUsername: string };

export function createHandleKickWebhook(deps: {
  verifier: WebhookSignatureVerifier;
  processedMessages: ProcessedMessageStore;
  channel: KickChannelDirectory;
  grantModeratorFromChatBadge: (input: {
    kickUserId: number;
    username: string;
  }) => Promise<ChatBadgeGrantOutcome>;
  now?: () => number;
}) {
  const now = deps.now ?? Date.now;

  return async function handleKickWebhook(delivery: KickWebhookDelivery): Promise<WebhookOutcome> {
    const { headers } = delivery;
    if (!headers.messageId || !headers.timestamp || !headers.signature || !headers.eventType) {
      return { status: "rejected", reason: "malformed" };
    }

    const sentAt = Date.parse(headers.timestamp);
    if (Number.isNaN(sentAt) || Math.abs(now() - sentAt) > MAX_DELIVERY_AGE_MS) {
      return { status: "rejected", reason: "stale" };
    }

    if (!(await deps.verifier.verify(delivery))) {
      return { status: "rejected", reason: "bad_signature" };
    }

    if (await deps.processedMessages.wasProcessed(headers.messageId)) {
      return { status: "ignored", reason: "duplicate" };
    }

    const outcome = await processEvent(delivery);
    // Marked only after success, so Kick's retry of a failed delivery is processed again.
    await deps.processedMessages.markProcessed(headers.messageId);
    return outcome;
  };

  async function processEvent(delivery: KickWebhookDelivery): Promise<WebhookOutcome> {
    if (delivery.headers.eventType !== CHAT_MESSAGE_EVENT.name) {
      return { status: "ignored", reason: "unhandled_event" };
    }

    let payload: unknown;
    try {
      payload = JSON.parse(delivery.rawBody);
    } catch {
      return { status: "rejected", reason: "malformed" };
    }
    const parsed = chatMessageSchema.safeParse(payload);
    if (!parsed.success) return { status: "rejected", reason: "malformed" };

    const { broadcaster, sender } = parsed.data;
    if (broadcaster.user_id !== (await deps.channel.getBroadcasterUserId())) {
      return { status: "ignored", reason: "other_channel", senderUsername: sender.username };
    }

    const badges = (sender.identity?.badges ?? []).flatMap((badge) =>
      badge.type ? [badge.type.toLowerCase()] : [],
    );
    if (sender.is_anonymous || !badges.includes(MODERATOR_BADGE)) {
      return { status: "ignored", reason: "no_badge", senderUsername: sender.username, badges };
    }

    const username = sender.username.slice(0, 64);
    const moderator = await deps.grantModeratorFromChatBadge({
      kickUserId: sender.user_id,
      username,
    });
    return { status: "processed", moderator, senderUsername: username };
  }
}

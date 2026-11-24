import { createSign, generateKeyPairSync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { KickWebhookDelivery } from "@/kick-events/domain/kick-webhook";
import { verifyKickSignature } from "@/kick-events/infrastructure/kick-signature.verifier";
import { BROADCASTER_ID, FakeChannelDirectory } from "@/test/fakes";
import { createHandleKickWebhook } from "./handle-kick-webhook";

vi.mock("server-only", () => ({}));

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const NOW = Date.parse("2026-11-23T20:00:00Z");

function signedDelivery(
  payload: unknown,
  overrides: Partial<KickWebhookDelivery["headers"]> = {},
): KickWebhookDelivery {
  const rawBody = JSON.stringify(payload);
  const headers = {
    messageId: overrides.messageId ?? "01JDEXAMPLE",
    timestamp: overrides.timestamp ?? new Date(NOW).toISOString(),
    eventType: overrides.eventType ?? "chat.message.sent",
    eventVersion: overrides.eventVersion ?? "1",
    signature: "",
  };
  const signer = createSign("RSA-SHA256");
  signer.update(`${headers.messageId}.${headers.timestamp}.${rawBody}`);
  headers.signature = overrides.signature ?? signer.sign(privateKey, "base64");
  return { headers, rawBody };
}

function chatMessage(badges: { type: string }[], broadcasterId = BROADCASTER_ID) {
  return {
    message_id: "m1",
    broadcaster: { user_id: broadcasterId, username: "elmune" },
    sender: {
      is_anonymous: false,
      user_id: 77,
      username: "moderadora",
      identity: {
        username_color: "#fff",
        badges: badges.map((badge) => ({ text: badge.type, ...badge })),
      },
    },
    content: "hola",
  };
}

function setup() {
  const processed = new Set<string>();
  const grant = vi.fn<(input: { kickUserId: number; username: string }) => Promise<"granted">>(
    async () => "granted",
  );
  const handle = createHandleKickWebhook({
    verifier: { verify: async (delivery) => verifyKickSignature(publicKey, delivery) },
    processedMessages: {
      wasProcessed: async (id) => processed.has(id),
      markProcessed: async (id) => {
        processed.add(id);
      },
    },
    channel: new FakeChannelDirectory(),
    grantModeratorFromChatBadge: grant,
    now: () => NOW,
  });
  return { handle, grant };
}

describe("handleKickWebhook", () => {
  it("grants moderators from signed chat messages with the moderator badge", async () => {
    const { handle, grant } = setup();

    const outcome = await handle(signedDelivery(chatMessage([{ type: "moderator" }])));

    expect(outcome).toEqual({
      status: "processed",
      moderator: "granted",
      senderUsername: "moderadora",
    });
    expect(grant).toHaveBeenCalledWith({ kickUserId: 77, username: "moderadora" });
  });

  it("rejects tampered bodies", async () => {
    const { handle, grant } = setup();
    const delivery = signedDelivery(chatMessage([{ type: "moderator" }]));
    delivery.rawBody = delivery.rawBody.replace("77", "78");

    expect(await handle(delivery)).toEqual({ status: "rejected", reason: "bad_signature" });
    expect(grant).not.toHaveBeenCalled();
  });

  it("rejects stale deliveries", async () => {
    const { handle } = setup();
    const delivery = signedDelivery(chatMessage([{ type: "moderator" }]), {
      timestamp: new Date(NOW - 2 * 60 * 60 * 1000).toISOString(),
    });

    expect(await handle(delivery)).toEqual({ status: "rejected", reason: "stale" });
  });

  it("ignores replays, other channels and regular viewers", async () => {
    const { handle, grant } = setup();
    const delivery = signedDelivery(chatMessage([{ type: "moderator" }]));
    await handle(delivery);

    expect(await handle(delivery)).toMatchObject({ reason: "duplicate" });
    expect(
      await handle(signedDelivery(chatMessage([{ type: "moderator" }], 999), { messageId: "2" })),
    ).toMatchObject({ reason: "other_channel" });
    expect(
      await handle(signedDelivery(chatMessage([{ type: "subscriber" }]), { messageId: "3" })),
    ).toMatchObject({ reason: "no_badge" });
    expect(grant).toHaveBeenCalledTimes(1);
  });

  it("tolerates other event versions, null fields and badge casing", async () => {
    const { handle, grant } = setup();
    const payload = chatMessage([{ type: "Moderator" }]);
    const sender = payload.sender as Record<string, unknown>;
    sender.is_anonymous = null;
    (sender.identity as { badges: unknown[] }).badges.push({ type: null, text: "x" });

    const outcome = await handle(signedDelivery(payload, { eventVersion: "2", messageId: "4" }));

    expect(outcome).toMatchObject({ status: "processed" });
    expect(grant).toHaveBeenCalledOnce();
  });

  it("processes Kick's retry when the first attempt failed", async () => {
    const { handle, grant } = setup();
    const delivery = signedDelivery(chatMessage([{ type: "moderator" }]), { messageId: "5" });
    grant.mockRejectedValueOnce(new Error("database down"));

    await expect(handle(delivery)).rejects.toThrow("database down");
    expect(await handle(delivery)).toMatchObject({ status: "processed" });
  });

  it("accepts deliveries retried within the hour", async () => {
    const { handle } = setup();
    const delivery = signedDelivery(chatMessage([{ type: "moderator" }]), {
      messageId: "6",
      timestamp: new Date(NOW - 30 * 60 * 1000).toISOString(),
    });

    expect(await handle(delivery)).toMatchObject({ status: "processed" });
  });
});

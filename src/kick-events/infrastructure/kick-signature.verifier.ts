import "server-only";
import { createPublicKey, createVerify, type KeyObject } from "node:crypto";
import type { KickApiClient } from "@/kick-platform/infrastructure/kick-api.client";
import type {
  KickWebhookDelivery,
  WebhookSignatureVerifier,
} from "@/kick-events/domain/kick-webhook";

const KEY_CACHE_MS = 60 * 60 * 1000;
const MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

let cachedKey: { key: KeyObject; fetchedAt: number } | null = null;

/** Verifies Kick's RSA-SHA256 (PKCS#1 v1.5) signature over `messageId.timestamp.body`. */
export function verifyKickSignature(publicKey: KeyObject, delivery: KickWebhookDelivery): boolean {
  const { messageId, timestamp, signature } = delivery.headers;
  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${messageId}.${timestamp}.${delivery.rawBody}`);
  verifier.end();
  try {
    return verifier.verify(publicKey, Buffer.from(signature, "base64"));
  } catch {
    return false;
  }
}

export class KickSignatureVerifier implements WebhookSignatureVerifier {
  constructor(private readonly kick: KickApiClient) {}

  async verify(delivery: KickWebhookDelivery): Promise<boolean> {
    if (verifyKickSignature(await this.getKey(false), delivery)) return true;
    // Kick may rotate its key; retry once with a fresh copy, rate-limited to avoid key-fetch floods.
    if (cachedKey && Date.now() - cachedKey.fetchedAt > MIN_REFRESH_INTERVAL_MS) {
      return verifyKickSignature(await this.getKey(true), delivery);
    }
    return false;
  }

  private async getKey(forceRefresh: boolean): Promise<KeyObject> {
    if (!forceRefresh && cachedKey && Date.now() - cachedKey.fetchedAt < KEY_CACHE_MS) {
      return cachedKey.key;
    }
    const pem = await this.kick.getPublicKey();
    cachedKey = { key: createPublicKey(pem), fetchedAt: Date.now() };
    return cachedKey.key;
  }
}

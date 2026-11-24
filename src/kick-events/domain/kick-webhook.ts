export interface KickWebhookHeaders {
  messageId: string;
  timestamp: string;
  signature: string;
  eventType: string;
  eventVersion: string;
}

export interface KickWebhookDelivery {
  headers: KickWebhookHeaders;
  rawBody: string;
}

export interface WebhookSignatureVerifier {
  verify(delivery: KickWebhookDelivery): Promise<boolean>;
}

export interface ProcessedMessageStore {
  wasProcessed(messageId: string): Promise<boolean>;
  markProcessed(messageId: string): Promise<void>;
}

export interface KickEventSubscriptions {
  list(): Promise<{ event: string; broadcasterUserId: number | null }[]>;
  subscribe(broadcasterUserId: number, events: { name: string; version: number }[]): Promise<void>;
}

export const CHAT_MESSAGE_EVENT = { name: "chat.message.sent", version: 1 } as const;

/**
 * Deliveries older than this are rejected to limit replay of captured requests. It leaves room
 * for Kick's retries, and message ids are deduplicated for longer than this window.
 */
export const MAX_DELIVERY_AGE_MS = 60 * 60 * 1000;

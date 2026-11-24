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
  /** Returns false when the message id was already processed. */
  markProcessed(messageId: string): Promise<boolean>;
}

export interface KickEventSubscriptions {
  list(): Promise<{ event: string; broadcasterUserId: number | null }[]>;
  subscribe(broadcasterUserId: number, events: { name: string; version: number }[]): Promise<void>;
}

export const CHAT_MESSAGE_EVENT = { name: "chat.message.sent", version: 1 } as const;

/** Deliveries older than this are rejected to limit replay of captured requests. */
export const MAX_DELIVERY_AGE_MS = 10 * 60 * 1000;

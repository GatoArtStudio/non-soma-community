import "server-only";
import type { KickApiClient } from "@/kick-platform/infrastructure/kick-api.client";
import type { KickEventSubscriptions } from "@/kick-events/domain/kick-webhook";

export class KickApiEventSubscriptions implements KickEventSubscriptions {
  constructor(private readonly kick: KickApiClient) {}

  async list() {
    const subscriptions = await this.kick.listEventSubscriptions();
    return subscriptions.map((subscription) => ({
      event: subscription.event,
      broadcasterUserId: subscription.broadcaster_user_id ?? null,
    }));
  }

  subscribe(broadcasterUserId: number, events: { name: string; version: number }[]) {
    return this.kick.subscribeToEvents(broadcasterUserId, events);
  }
}

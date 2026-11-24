import type { KickChannelDirectory } from "@/moderators/domain/kick-channel.port";
import { assertCanManageTeam, type Actor } from "@/moderators/domain/staff-member";
import { CHAT_MESSAGE_EVENT, type KickEventSubscriptions } from "@/kick-events/domain/kick-webhook";

export function createChatSubscription(deps: {
  subscriptions: KickEventSubscriptions;
  channel: KickChannelDirectory;
}) {
  async function isSubscribed(): Promise<boolean> {
    const broadcasterUserId = await deps.channel.getBroadcasterUserId();
    const subscriptions = await deps.subscriptions.list();
    return subscriptions.some(
      (subscription) =>
        subscription.event === CHAT_MESSAGE_EVENT.name &&
        (subscription.broadcasterUserId === null ||
          subscription.broadcasterUserId === broadcasterUserId),
    );
  }

  async function getChatSubscriptionStatus(actor: Actor): Promise<boolean> {
    assertCanManageTeam(actor);
    return isSubscribed();
  }

  /**
   * Creates the subscription when missing. Kick drops subscriptions whose webhook keeps failing,
   * so this runs on startup and periodically, besides the owner's manual button.
   */
  async function ensureChannelSubscription(): Promise<"created" | "already_subscribed"> {
    if (await isSubscribed()) return "already_subscribed";
    await deps.subscriptions.subscribe(await deps.channel.getBroadcasterUserId(), [
      CHAT_MESSAGE_EVENT,
    ]);
    return "created";
  }

  async function ensureChatSubscription(actor: Actor): Promise<"created" | "already_subscribed"> {
    assertCanManageTeam(actor);
    return ensureChannelSubscription();
  }

  return { getChatSubscriptionStatus, ensureChatSubscription, ensureChannelSubscription };
}

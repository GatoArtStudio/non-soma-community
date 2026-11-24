import "server-only";
import { getChatSubscription } from "@/kick-events/container";

/**
 * Makes sure Kick sends `chat.message.sent` for the community channel, without depending on
 * the owner pressing the button in the panel. Runs in the background so startup is not delayed.
 */
export function keepChatSubscriptionAlive(intervalMs: number): void {
  const check = async () => {
    try {
      const outcome = await getChatSubscription().ensureChannelSubscription();
      console.info("[kick-subscription]", outcome);
    } catch (error) {
      console.error("[kick-subscription] could not ensure the chat subscription:", error);
    }
  };

  void check();
  setInterval(check, intervalMs).unref();
}

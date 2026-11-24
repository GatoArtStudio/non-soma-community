const SUBSCRIPTION_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

export async function register() {
  if (
    process.env.NEXT_RUNTIME !== "nodejs" ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return;
  }
  const { keepChatSubscriptionAlive } =
    await import("@/kick-events/presentation/subscription-keeper");
  keepChatSubscriptionAlive(SUBSCRIPTION_CHECK_INTERVAL_MS);
}

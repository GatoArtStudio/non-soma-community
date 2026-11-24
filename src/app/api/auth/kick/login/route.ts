import { NextResponse, type NextRequest } from "next/server";
import { getKickLogin } from "@/authentication/container";
import { writePendingLogin } from "@/authentication/presentation/session-cookies";
import { getRateLimiter } from "@/bot-protection/container";
import { rateLimitPolicies } from "@/bot-protection/domain/rate-limit-policies";
import { getRequestFingerprint } from "@/bot-protection/presentation/request-fingerprint";
import { getEnv } from "@/shared/config/env";

export async function GET(request: NextRequest) {
  const { networkHash } = await getRequestFingerprint();
  const allowed = await getRateLimiter().consume(
    rateLimitPolicies.loginAttemptsPerNetwork(networkHash),
  );
  if (!allowed) {
    return NextResponse.redirect(new URL("/?login_error=rate_limited", getEnv().APP_URL));
  }

  const { authorizeUrl, pending } = getKickLogin().startKickLogin(
    request.nextUrl.searchParams.get("returnTo"),
  );
  await writePendingLogin(pending);
  return NextResponse.redirect(authorizeUrl);
}

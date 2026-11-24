import "server-only";
import { cookies, headers } from "next/headers";
import { getEnv, isSecureContext } from "@/shared/config/env";
import { generateToken, hmacHex } from "@/shared/crypto/tokens";
import { normalizeNetwork } from "@/bot-protection/domain/network";

const VISITOR_COOKIE = "nsc_visitor";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface RequestFingerprint {
  /** Raw client IP, only forwarded to Turnstile and never persisted. */
  remoteIp: string | null;
  networkHash: string;
}

export async function getRequestFingerprint(): Promise<RequestFingerprint> {
  const headerList = await headers();
  const env = getEnv();
  const remoteIp = resolveClientIp(headerList, env.TRUST_CLOUDFLARE);
  return {
    remoteIp,
    networkHash: hmacHex(env.APP_SECRET, "network", normalizeNetwork(remoteIp ?? "unknown")),
  };
}

/**
 * Returns a hashed, stable id for an anonymous browser. Creates the cookie when missing,
 * so it may only be called from Server Actions or Route Handlers.
 */
export async function getOrCreateVisitorHash(): Promise<string> {
  const cookieStore = await cookies();
  let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
  if (!visitorId || visitorId.length > 64) {
    visitorId = generateToken(24);
    cookieStore.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: isSecureContext(),
      sameSite: "lax",
      path: "/",
      maxAge: VISITOR_COOKIE_MAX_AGE,
    });
  }
  return hmacHex(getEnv().APP_SECRET, "visitor", visitorId);
}

export async function readVisitorHash(): Promise<string | null> {
  const visitorId = (await cookies()).get(VISITOR_COOKIE)?.value;
  return visitorId ? hmacHex(getEnv().APP_SECRET, "visitor", visitorId) : null;
}

function resolveClientIp(headerList: Headers, trustCloudflare: boolean): string | null {
  if (trustCloudflare) {
    return headerList.get("cf-connecting-ip")?.trim() || null;
  }
  const forwarded = headerList.get("x-forwarded-for");
  // Without a trusted edge, only the hop appended by our own reverse proxy is reliable.
  const lastHop = forwarded?.split(",").at(-1)?.trim();
  return lastHop || headerList.get("x-real-ip")?.trim() || null;
}

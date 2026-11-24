import "server-only";
import { cookies, headers } from "next/headers";
import { getEnv, isSecureContext } from "@/shared/config/env";
import { generateToken, hmacHex } from "@/shared/crypto/tokens";
import { resolveClientIp } from "./client-ip";

const VISITOR_COOKIE = "nsc_visitor";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Raw client IP, only forwarded to Turnstile to improve its verdict and never stored. */
export async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  return resolveClientIp(headerList, getEnv().TRUST_CLOUDFLARE);
}

/**
 * Returns a hashed, stable id for this device. Creates the cookie when missing, so it may only
 * be called from Server Actions or Route Handlers, after the visitor accepted cookies.
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

export async function deleteVisitorCookie(): Promise<void> {
  (await cookies()).delete(VISITOR_COOKIE);
}

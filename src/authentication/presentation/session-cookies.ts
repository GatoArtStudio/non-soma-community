import "server-only";
import { cookies } from "next/headers";
import { getEnv, isSecureContext } from "@/shared/config/env";
import { seal, unseal } from "@/shared/crypto/sealed-box";
import { PENDING_LOGIN_TTL_MS, type PendingLogin } from "@/authentication/domain/pending-login";

/** `__Host-` cookies require HTTPS, so local HTTP development falls back to plain names. */
function cookieName(base: string): string {
  return isSecureContext() ? `__Host-${base}` : base;
}

export const sessionCookieName = () => cookieName("nsc_session");
const pendingLoginCookieName = () => cookieName("nsc_kick_login");

export async function readSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(sessionCookieName())?.value;
}

export async function writeSessionCookie(token: string, expiresAt: Date): Promise<void> {
  (await cookies()).set(sessionCookieName(), token, {
    httpOnly: true,
    secure: isSecureContext(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(sessionCookieName());
}

export async function writePendingLogin(pending: PendingLogin): Promise<void> {
  (await cookies()).set(
    pendingLoginCookieName(),
    seal(getEnv().APP_SECRET, "kick-login", pending),
    {
      httpOnly: true,
      secure: isSecureContext(),
      sameSite: "lax",
      path: "/",
      maxAge: PENDING_LOGIN_TTL_MS / 1000,
    },
  );
}

/** Reads and deletes the pending login so each OAuth state can be used once. */
export async function consumePendingLogin(): Promise<PendingLogin | null> {
  const cookieStore = await cookies();
  const sealed = cookieStore.get(pendingLoginCookieName())?.value;
  cookieStore.delete(pendingLoginCookieName());
  return sealed ? unseal<PendingLogin>(getEnv().APP_SECRET, "kick-login", sealed) : null;
}

import "server-only";
import { cookies } from "next/headers";
import { DomainError } from "@/shared/errors/domain-error";
import { CONSENT_COOKIE, parseConsent } from "@/cookie-consent/domain/consent";

/** Voting and proposing rely on a device cookie, so they require the visitor's consent. */
export async function requireCookieConsent(): Promise<void> {
  const consent = parseConsent((await cookies()).get(CONSENT_COOKIE)?.value);
  if (consent !== "accepted") throw new DomainError("cookie_consent_required");
}

export const CONSENT_COOKIE = "nsc_cookie_consent";
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type ConsentChoice = "accepted" | "rejected";
/** "unknown" means the visitor has not chosen yet; "pending" is the server render, before reading it. */
export type ConsentState = ConsentChoice | "unknown" | "pending";

export function parseConsent(value: string | undefined | null): ConsentChoice | "unknown" {
  return value === "accepted" || value === "rejected" ? value : "unknown";
}

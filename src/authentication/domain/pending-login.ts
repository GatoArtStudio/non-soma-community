/** OAuth state kept between the redirect to Kick and the callback. */
export interface PendingLogin {
  state: string;
  codeVerifier: string;
  returnTo: string;
  expiresAt: number;
}

export const PENDING_LOGIN_TTL_MS = 10 * 60 * 1000;

/** Only same-origin relative paths are accepted, to avoid open redirects. */
export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  return value.slice(0, 200);
}

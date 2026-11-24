import type { KickIdentity } from "./session-user";

export interface KickOAuth {
  buildAuthorizeUrl(input: { state: string; codeChallenge: string }): string;
  exchangeCode(input: { code: string; codeVerifier: string }): Promise<string>;
  fetchIdentity(accessToken: string): Promise<KickIdentity>;
  revokeToken(accessToken: string): Promise<void>;
}

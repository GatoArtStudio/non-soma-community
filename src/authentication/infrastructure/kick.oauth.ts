import "server-only";
import { z } from "zod";
import type { KickOAuth } from "@/authentication/domain/kick-oauth.port";
import type { KickIdentity } from "@/authentication/domain/session-user";
import { KICK_ID_URL, type KickApiClient } from "@/kick-platform/infrastructure/kick-api.client";

const LOGIN_SCOPES = "user:read";

const tokenResponseSchema = z.object({ access_token: z.string() });

export class KickOAuthClient implements KickOAuth {
  constructor(
    private readonly config: { clientId: string; clientSecret: string; redirectUri: string },
    private readonly api: KickApiClient,
  ) {}

  buildAuthorizeUrl({ state, codeChallenge }: { state: string; codeChallenge: string }): string {
    const url = new URL(`${KICK_ID_URL}/oauth/authorize`);
    url.search = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: LOGIN_SCOPES,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    }).toString();
    return url.toString();
  }

  async exchangeCode({ code, codeVerifier }: { code: string; codeVerifier: string }) {
    const response = await fetch(`${KICK_ID_URL}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code_verifier: codeVerifier,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Kick token exchange failed with ${response.status}`);
    return tokenResponseSchema.parse(await response.json()).access_token;
  }

  async fetchIdentity(accessToken: string): Promise<KickIdentity> {
    const user = await this.api.getAuthenticatedUser(accessToken);
    return {
      kickUserId: user.user_id,
      username: user.name,
      avatarUrl: user.profile_picture || null,
    };
  }

  async revokeToken(accessToken: string): Promise<void> {
    const url = new URL(`${KICK_ID_URL}/oauth/revoke`);
    url.search = new URLSearchParams({
      token: accessToken,
      token_hint_type: "access_token",
    }).toString();
    await fetch(url, { method: "POST", signal: AbortSignal.timeout(5000), cache: "no-store" });
  }
}

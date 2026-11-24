import "server-only";
import { z } from "zod";

export const KICK_ID_URL = "https://id.kick.com";
export const KICK_API_URL = "https://api.kick.com/public/v1";

const REQUEST_TIMEOUT_MS = 10_000;

const appTokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.coerce.number().optional(),
});

const channelSchema = z.object({
  broadcaster_user_id: z.number(),
  slug: z.string(),
});

const userSchema = z.object({
  user_id: z.number(),
  name: z.string(),
  profile_picture: z.string().nullish(),
});

const subscriptionSchema = z.object({
  id: z.string(),
  event: z.string(),
  version: z.number(),
  broadcaster_user_id: z.number().optional(),
  method: z.string().optional(),
});

export type KickChannel = z.infer<typeof channelSchema>;
export type KickUser = z.infer<typeof userSchema>;
export type KickEventSubscription = z.infer<typeof subscriptionSchema>;

export class KickApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "KickApiError";
  }
}

interface CachedAppToken {
  value: string;
  expiresAt: number;
}

/**
 * Thin client over the Kick public API. Uses an app access token (client credentials)
 * for public data and webhook subscriptions.
 */
export class KickApiClient {
  private appToken: CachedAppToken | null = null;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  async getChannelBySlug(slug: string): Promise<KickChannel | null> {
    const body = await this.appRequest(`/channels?slug=${encodeURIComponent(slug)}`);
    const channels = z.object({ data: z.array(channelSchema) }).parse(body).data;
    return channels.find((channel) => channel.slug.toLowerCase() === slug.toLowerCase()) ?? null;
  }

  async getAuthenticatedUser(userAccessToken: string): Promise<KickUser> {
    const body = await this.request("/users", { token: userAccessToken });
    const [user] = z.object({ data: z.array(userSchema) }).parse(body).data;
    if (!user) throw new KickApiError("Kick returned no user for the access token", 502);
    return user;
  }

  async getUsersByIds(ids: number[]): Promise<KickUser[]> {
    const query = ids.map((id) => `id=${id}`).join("&");
    const body = await this.appRequest(`/users?${query}`);
    return z.object({ data: z.array(userSchema) }).parse(body).data;
  }

  async getPublicKey(): Promise<string> {
    const body = await this.request("/public-key", {});
    return z.object({ data: z.object({ public_key: z.string() }) }).parse(body).data.public_key;
  }

  async listEventSubscriptions(): Promise<KickEventSubscription[]> {
    const body = await this.appRequest("/events/subscriptions");
    return z.object({ data: z.array(subscriptionSchema) }).parse(body).data;
  }

  async subscribeToEvents(
    broadcasterUserId: number,
    events: { name: string; version: number }[],
  ): Promise<void> {
    await this.appRequest("/events/subscriptions", {
      method: "POST",
      json: { broadcaster_user_id: broadcasterUserId, events, method: "webhook" },
    });
  }

  private async appRequest(path: string, init: { method?: string; json?: unknown } = {}) {
    return this.request(path, { ...init, token: await this.getAppToken() });
  }

  private async request(
    path: string,
    { token, method = "GET", json }: { token?: string; method?: string; json?: unknown },
  ): Promise<unknown> {
    const response = await fetch(`${KICK_API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: json !== undefined ? JSON.stringify(json) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    if (response.status === 401 && token && this.appToken?.value === token) {
      this.appToken = null;
    }
    if (!response.ok) {
      throw new KickApiError(`Kick API ${method} ${path} failed`, response.status);
    }
    return response.status === 204 ? null : response.json();
  }

  private async getAppToken(): Promise<string> {
    if (this.appToken && this.appToken.expiresAt > Date.now() + 60_000) {
      return this.appToken.value;
    }
    const response = await fetch(`${KICK_ID_URL}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      throw new KickApiError("Could not obtain a Kick app access token", response.status);
    }
    const token = appTokenSchema.parse(await response.json());
    const lifetimeSeconds = token.expires_in ?? 3600;
    this.appToken = { value: token.access_token, expiresAt: Date.now() + lifetimeSeconds * 1000 };
    return token.access_token;
  }
}

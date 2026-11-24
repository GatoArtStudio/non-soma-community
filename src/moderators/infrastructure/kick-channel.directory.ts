import "server-only";
import type { KickApiClient } from "@/kick-platform/infrastructure/kick-api.client";
import type { KickAccount, KickChannelDirectory } from "@/moderators/domain/kick-channel.port";

const BROADCASTER_CACHE_MS = 6 * 60 * 60 * 1000;

let cachedBroadcaster: { slug: string; userId: number; expiresAt: number } | null = null;

export class KickApiChannelDirectory implements KickChannelDirectory {
  constructor(
    private readonly kick: KickApiClient,
    private readonly channelSlug: string,
  ) {}

  async getBroadcasterUserId(): Promise<number> {
    if (
      cachedBroadcaster &&
      cachedBroadcaster.slug === this.channelSlug &&
      cachedBroadcaster.expiresAt > Date.now()
    ) {
      return cachedBroadcaster.userId;
    }
    const channel = await this.kick.getChannelBySlug(this.channelSlug);
    if (!channel) throw new Error(`Kick channel "${this.channelSlug}" was not found`);
    cachedBroadcaster = {
      slug: this.channelSlug,
      userId: channel.broadcaster_user_id,
      expiresAt: Date.now() + BROADCASTER_CACHE_MS,
    };
    return channel.broadcaster_user_id;
  }

  async findAccountBySlug(slug: string): Promise<KickAccount | null> {
    const channel = await this.kick.getChannelBySlug(slug);
    if (!channel) return null;
    const [user] = await this.kick.getUsersByIds([channel.broadcaster_user_id]);
    return {
      kickUserId: channel.broadcaster_user_id,
      username: user?.name ?? channel.slug,
    };
  }
}

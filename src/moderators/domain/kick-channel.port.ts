export interface KickAccount {
  kickUserId: number;
  username: string;
}

export interface KickChannelDirectory {
  /** Kick user id of the broadcaster that owns the community channel. */
  getBroadcasterUserId(): Promise<number>;
  /** Resolves a Kick account from its channel slug (the username in the channel URL). */
  findAccountBySlug(slug: string): Promise<KickAccount | null>;
}

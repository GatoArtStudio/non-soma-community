export interface KickIdentity {
  kickUserId: number;
  username: string;
  avatarUrl: string | null;
}

export interface SessionUser extends KickIdentity {
  id: number;
}

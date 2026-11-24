export const MODERATION_ACTION_TYPES = [
  "approve_book",
  "reject_book",
  "restore_book",
  "delete_book",
  "mark_read",
  "mark_unread",
  "start_reading",
  "update_chapter",
  "finish_reading",
  "cancel_reading",
  "grant_moderator",
  "revoke_moderator",
  "restore_moderator",
] as const;

export type ModerationActionType = (typeof MODERATION_ACTION_TYPES)[number];

export interface ModerationActionEntry {
  actorUserId: number | null;
  action: ModerationActionType;
  bookId?: number | null;
  bookTitle?: string | null;
  targetKickUserId?: number | null;
  detail?: string | null;
}

export interface RecordedModerationAction extends ModerationActionEntry {
  id: number;
  actorUsername: string | null;
  createdAt: Date;
}

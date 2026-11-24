import type { ModerationActionType } from "@/moderation/domain/moderation-action";

export const MODERATION_ACTION_LABELS: Record<ModerationActionType, string> = {
  approve_book: "aprobó",
  reject_book: "rechazó",
  restore_book: "publicó una propuesta rechazada",
  delete_book: "eliminó",
  mark_read: "marcó como leído",
  mark_unread: "quitó de leídos",
  start_reading: "empezó la lectura de",
  update_chapter: "actualizó el capítulo",
  finish_reading: "terminó la lectura",
  cancel_reading: "canceló la lectura",
  grant_moderator: "dio acceso de moderador a",
  revoke_moderator: "retiró el acceso a un moderador",
  restore_moderator: "restauró el acceso de",
};

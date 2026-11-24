import { isDomainError } from "./domain-error";
import type { ActionState } from "@/shared/ui/action-state";

/** User-facing (es-CO) messages for domain error codes. */
const MESSAGES: Record<string, string> = {
  rate_limited: "Hiciste demasiados intentos. Espera un rato y vuelve a intentarlo.",
  human_verification_failed:
    "No pudimos verificar que eres humano. Completa la verificación de nuevo.",
  invalid_work_key: "Ese libro no es válido. Búscalo y selecciónalo de la lista.",
  book_not_found_in_catalog: "No encontramos ese libro en el catálogo.",
  book_not_found: "El libro ya no existe.",
  book_changed_concurrently: "Otro moderador cambió este libro. Recarga la página.",
  invalid_status_transition: "Esta acción no aplica al estado actual del libro.",
  use_reading_flow: "Este libro es la lectura actual. Gestiónalo desde «Lectura actual».",
  reading_in_progress: "Ya hay una lectura en curso. Termínala o cancélala primero.",
  no_reading_in_progress: "No hay ninguna lectura en curso.",
  not_moderator: "Necesitas ser moderador del canal para hacer esto.",
  not_owner: "Solo el dueño del canal puede hacer esto.",
  not_signed_in: "Inicia sesión con Kick para continuar.",
  kick_account_not_found: "No encontramos esa cuenta de Kick.",
  cannot_target_owner: "El dueño del canal siempre tiene acceso.",
  invalid_username: "Escribe un nombre de usuario de Kick válido.",
  invalid_login_state: "La sesión de inicio expiró. Vuelve a intentarlo.",
  kick_login_failed: "Kick no completó el inicio de sesión. Vuelve a intentarlo.",
};

const FALLBACK = "Algo salió mal. Vuelve a intentarlo en unos minutos.";

export function messageForError(error: unknown): string {
  if (isDomainError(error)) return MESSAGES[error.code] ?? FALLBACK;
  return FALLBACK;
}

export function messageForCode(code: string | null | undefined): string | null {
  return code ? (MESSAGES[code] ?? FALLBACK) : null;
}

/** Converts a thrown error into an action state, logging anything unexpected. */
export function errorState(error: unknown): ActionState {
  if (!isDomainError(error)) console.error(error);
  return { status: "error", message: messageForError(error) };
}

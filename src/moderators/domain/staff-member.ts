import { DomainError } from "@/shared/errors/domain-error";
import { canManageTeam, canModerate, type Role } from "./role";

/** An authenticated user acting with their resolved role. */
export interface Actor {
  userId: number;
  kickUserId: number;
  username: string;
  role: Role;
}

export type AuthorizationErrorCode = "not_moderator" | "not_owner";

export function assertCanModerate(actor: Actor): void {
  if (!canModerate(actor.role)) throw new DomainError<AuthorizationErrorCode>("not_moderator");
}

export function assertCanManageTeam(actor: Actor): void {
  if (!canManageTeam(actor.role)) throw new DomainError<AuthorizationErrorCode>("not_owner");
}

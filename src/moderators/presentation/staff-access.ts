import "server-only";
import { DomainError } from "@/shared/errors/domain-error";
import { getActor } from "@/authentication/presentation/viewer";
import { canManageTeam, canModerate } from "@/moderators/domain/role";
import type { Actor } from "@/moderators/domain/staff-member";

/** Returns the current moderator or owner, or null for everyone else. */
export async function findStaffActor(): Promise<Actor | null> {
  const actor = await getActor();
  return actor && canModerate(actor.role) ? actor : null;
}

export async function findOwnerActor(): Promise<Actor | null> {
  const actor = await getActor();
  return actor && canManageTeam(actor.role) ? actor : null;
}

/** For Server Actions: the signed-in actor, or a `not_signed_in` error. Role checks happen in use cases. */
export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) throw new DomainError("not_signed_in");
  return actor;
}

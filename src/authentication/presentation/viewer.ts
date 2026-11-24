import "server-only";
import { cache } from "react";
import type { SessionUser } from "@/authentication/domain/session-user";
import { getSessionAccess } from "@/authentication/container";
import { getResolveRole } from "@/moderators/container";
import type { Role } from "@/moderators/domain/role";
import type { Actor } from "@/moderators/domain/staff-member";
import { readSessionToken } from "./session-cookies";

export interface Viewer {
  user: SessionUser | null;
  role: Role;
}

/** Current request's user and role. Deduplicated per request; reads cookies, so call inside Suspense. */
export const getViewer = cache(async (): Promise<Viewer> => {
  const sessionToken = await readSessionToken();
  const user = await getSessionAccess().getSessionUser(sessionToken);
  if (!user) return { user: null, role: "member" };
  return { user, role: await getResolveRole()(user.kickUserId) };
});

export async function getActor(): Promise<Actor | null> {
  const { user, role } = await getViewer();
  if (!user) return null;
  return { userId: user.id, kickUserId: user.kickUserId, username: user.username, role };
}

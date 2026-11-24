export type Role = "owner" | "moderator" | "member";

export function canModerate(role: Role): boolean {
  return role === "owner" || role === "moderator";
}

export function canManageTeam(role: Role): boolean {
  return role === "owner";
}

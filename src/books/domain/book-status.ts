import { DomainError } from "@/shared/errors/domain-error";

export const BOOK_STATUSES = ["pending", "approved", "rejected", "reading", "read"] as const;

export type BookStatus = (typeof BOOK_STATUSES)[number];

/** Books the community can see and like. */
export const PUBLISHED_STATUSES = ["approved", "reading", "read"] as const satisfies BookStatus[];

const ALLOWED_TRANSITIONS: Record<BookStatus, readonly BookStatus[]> = {
  pending: ["approved", "rejected"],
  approved: ["reading", "read"],
  rejected: ["approved"],
  reading: ["read", "approved"],
  read: ["reading", "approved"],
};

export function canTransition(from: BookStatus, to: BookStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: BookStatus, to: BookStatus): void {
  if (!canTransition(from, to)) {
    throw new DomainError("invalid_status_transition", `Cannot move a book from ${from} to ${to}`);
  }
}

export function isPublished(status: BookStatus): boolean {
  return (PUBLISHED_STATUSES as readonly BookStatus[]).includes(status);
}

import { DomainError } from "@/shared/errors/domain-error";
import type { GuardHumanAction } from "@/bot-protection/application/guard-human-action";
import { rateLimitPolicies } from "@/bot-protection/domain/rate-limit-policies";
import type { BookCatalog } from "@/books/domain/book-catalog.port";
import { isValidWorkKey, type Book } from "@/books/domain/book";
import type { BookRepository } from "@/books/domain/book.repository";
import { canModerate, type Role } from "@/moderators/domain/role";

export type ProposeBookErrorCode = "invalid_work_key" | "book_not_found_in_catalog";

export interface ProposeBookInput {
  workKey: string;
  proposer: { userId: number; role: Role } | null;
  verificationToken: string;
  remoteIp: string | null;
  networkHash: string;
}

export type ProposeBookResult =
  | { outcome: "proposed"; book: Book }
  | { outcome: "published"; book: Book }
  | { outcome: "already_exists"; book: Book };

export function createProposeBook(deps: {
  books: BookRepository;
  catalog: BookCatalog;
  guardHumanAction: GuardHumanAction;
}) {
  return async function proposeBook(input: ProposeBookInput): Promise<ProposeBookResult> {
    if (!isValidWorkKey(input.workKey)) {
      throw new DomainError<ProposeBookErrorCode>("invalid_work_key");
    }

    await deps.guardHumanAction({
      action: "propose_book",
      verificationToken: input.verificationToken,
      remoteIp: input.remoteIp,
      rateLimits: input.proposer
        ? [rateLimitPolicies.userProposals(input.proposer.userId)]
        : [rateLimitPolicies.anonymousProposalsPerNetwork(input.networkHash)],
    });

    const existing = await deps.books.findByWorkKey(input.workKey);
    if (existing) return { outcome: "already_exists", book: existing };

    // Bibliographic data always comes from the catalog, never from the submitted form.
    const entry = await deps.catalog.findByWorkKey(input.workKey);
    if (!entry) throw new DomainError<ProposeBookErrorCode>("book_not_found_in_catalog");

    const publishDirectly = input.proposer !== null && canModerate(input.proposer.role);
    const created = await deps.books.create({
      entry,
      status: publishDirectly ? "approved" : "pending",
      proposerUserId: input.proposer?.userId ?? null,
    });

    if (!created) {
      const concurrent = await deps.books.findByWorkKey(input.workKey);
      if (!concurrent) throw new Error("Book insert conflicted but no book was found");
      return { outcome: "already_exists", book: concurrent };
    }
    return { outcome: publishDirectly ? "published" : "proposed", book: created };
  };
}

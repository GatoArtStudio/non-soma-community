import { DomainError } from "@/shared/errors/domain-error";
import type { GuardHumanAction } from "@/bot-protection/application/guard-human-action";
import { rateLimitPolicies } from "@/bot-protection/domain/rate-limit-policies";
import { isPublished } from "@/books/domain/book-status";
import type { BookRepository } from "@/books/domain/book.repository";
import type { LikeRepository } from "@/book-likes/domain/like.repository";
import { likerKey, type Liker } from "@/book-likes/domain/liker";

export type LikeErrorCode = "book_not_found";

export interface ToggleLikeInput {
  bookId: number;
  like: boolean;
  liker: Liker;
  verificationToken: string;
  remoteIp: string | null;
  networkHash: string;
}

export interface ToggleLikeResult {
  liked: boolean;
  likesCount: number;
}

export function createToggleLike(deps: {
  books: BookRepository;
  likes: LikeRepository;
  guardHumanAction: GuardHumanAction;
}) {
  async function toggleLike(input: ToggleLikeInput): Promise<ToggleLikeResult> {
    await deps.guardHumanAction({
      action: "like_book",
      verificationToken: input.verificationToken,
      remoteIp: input.remoteIp,
      rateLimits: [rateLimitPolicies.likesPerNetwork(input.networkHash)],
    });

    const book = await deps.books.findById(input.bookId);
    if (!book || !isPublished(book.status)) {
      throw new DomainError<LikeErrorCode>("book_not_found");
    }

    let liked: boolean;
    if (input.like) {
      await deps.likes.add(book.id, input.liker);
      liked = true;
    } else {
      await deps.likes.remove(book.id, input.liker);
      liked = false;
    }

    const updated = await deps.books.findById(book.id);
    return { liked, likesCount: updated?.likesCount ?? book.likesCount };
  }

  function findLikedBookIds(liker: Liker | null, bookIds: number[]): Promise<Set<number>> {
    if (!liker || bookIds.length === 0) return Promise.resolve(new Set());
    return deps.likes.findLikedBookIds(likerKey(liker), bookIds);
  }

  return { toggleLike, findLikedBookIds };
}

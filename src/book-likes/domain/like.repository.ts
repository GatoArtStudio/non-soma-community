import type { Liker } from "./liker";

export type AddLikeOutcome = "added" | "already_liked";

export interface LikeRepository {
  /** Inserts the like and increments the book counter atomically. */
  add(bookId: number, liker: Liker): Promise<AddLikeOutcome>;
  /** Removes the like and decrements the counter atomically. Returns false when there was none. */
  remove(bookId: number, liker: Liker): Promise<boolean>;
  findLikedBookIds(likerKey: string, bookIds: number[]): Promise<Set<number>>;
}

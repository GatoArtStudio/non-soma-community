import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { isDuplicateKeyError, type Database } from "@/shared/db/client";
import { booksTable } from "@/books/infrastructure/books.table";
import type { AddLikeOutcome, LikeRepository } from "@/book-likes/domain/like.repository";
import { likerKey, networkKey, type Liker } from "@/book-likes/domain/liker";
import { bookLikesTable } from "./book-likes.table";

export class DrizzleLikeRepository implements LikeRepository {
  constructor(private readonly db: Database) {}

  async add(bookId: number, liker: Liker): Promise<AddLikeOutcome> {
    try {
      await this.db.transaction(async (tx) => {
        await tx.insert(bookLikesTable).values({
          bookId,
          likerKey: likerKey(liker),
          networkKey: networkKey(liker),
        });
        await tx
          .update(booksTable)
          .set({ likesCount: sql`${booksTable.likesCount} + 1` })
          .where(eq(booksTable.id, bookId));
      });
      return "added";
    } catch (error) {
      if (isDuplicateKeyError(error)) return "already_liked";
      throw error;
    }
  }

  async remove(bookId: number, liker: Liker): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const [result] = await tx
        .delete(bookLikesTable)
        .where(
          and(eq(bookLikesTable.bookId, bookId), eq(bookLikesTable.likerKey, likerKey(liker))),
        );
      if (result.affectedRows === 0) return false;
      await tx
        .update(booksTable)
        .set({ likesCount: sql`greatest(${booksTable.likesCount}, 1) - 1` })
        .where(eq(booksTable.id, bookId));
      return true;
    });
  }

  async findLikedBookIds(key: string, bookIds: number[]): Promise<Set<number>> {
    const rows = await this.db
      .select({ bookId: bookLikesTable.bookId })
      .from(bookLikesTable)
      .where(and(eq(bookLikesTable.likerKey, key), inArray(bookLikesTable.bookId, bookIds)));
    return new Set(rows.map((row) => row.bookId));
  }
}

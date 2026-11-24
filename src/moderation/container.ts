import "server-only";
import { getDb } from "@/shared/db/client";
import { getBookRepository } from "@/books/container";
import { createReviewBooks } from "./application/review-books";
import { DrizzleModerationLog } from "./infrastructure/drizzle-moderation.log";

export function getModerationLog() {
  return new DrizzleModerationLog(getDb());
}

export function getReviewBooks() {
  return createReviewBooks({ books: getBookRepository(), log: getModerationLog() });
}

import type { Book } from "@/books/domain/book";

export interface OpenReading {
  id: number;
  bookId: number;
  currentChapter: string | null;
  startedAt: Date;
}

export interface CurrentReading extends OpenReading {
  book: Book;
}

export const MAX_CHAPTER_LENGTH = 120;

export function normalizeChapter(value: string | null | undefined): string | null {
  const chapter = value?.trim().slice(0, MAX_CHAPTER_LENGTH);
  return chapter || null;
}

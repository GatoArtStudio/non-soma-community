import type { BookStatus } from "./book-status";

export interface Book {
  id: number;
  openLibraryWorkKey: string;
  title: string;
  authors: string[];
  coverId: number | null;
  firstPublishYear: number | null;
  status: BookStatus;
  proposer: BookProposer | null;
  likesCount: number;
  createdAt: Date;
  reviewedAt: Date | null;
  readAt: Date | null;
}

export interface BookProposer {
  userId: number;
  username: string;
}

/** Bibliographic data coming from the external catalog, before it becomes a Book. */
export interface CatalogEntry {
  workKey: string;
  title: string;
  authors: string[];
  coverId: number | null;
  firstPublishYear: number | null;
}

const WORK_KEY_PATTERN = /^OL\d{1,12}W$/;

export function isValidWorkKey(value: string): boolean {
  return WORK_KEY_PATTERN.test(value);
}

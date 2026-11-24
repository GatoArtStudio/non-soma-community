import "server-only";
import { getDb } from "@/shared/db/client";
import { getBookRepository } from "@/books/container";
import { getModerationLog } from "@/moderation/container";
import { createManageReading } from "./application/manage-reading";
import { DrizzleReadingRepository } from "./infrastructure/drizzle-reading.repository";

export function getManageReading() {
  return createManageReading({
    readings: new DrizzleReadingRepository(getDb()),
    books: getBookRepository(),
    log: getModerationLog(),
  });
}

import "server-only";
import { getDb } from "@/shared/db/client";
import { getGuardHumanAction } from "@/bot-protection/container";
import { getBookRepository } from "@/books/container";
import { createToggleLike } from "./application/toggle-like";
import { DrizzleLikeRepository } from "./infrastructure/drizzle-like.repository";

export function getToggleLike() {
  return createToggleLike({
    books: getBookRepository(),
    likes: new DrizzleLikeRepository(getDb()),
    guardHumanAction: getGuardHumanAction(),
  });
}

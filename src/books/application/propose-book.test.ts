import { describe, expect, it, vi } from "vitest";
import { allowAllGuard, catalogEntry, FakeCatalog, InMemoryBookRepository } from "@/test/fakes";
import type { GuardHumanAction } from "@/bot-protection/application/guard-human-action";
import { createProposeBook } from "./propose-book";

const baseInput = {
  workKey: "OL274505W",
  verificationToken: "token",
  remoteIp: "203.0.113.5",
  visitorHash: "device-1",
};

describe("proposeBook", () => {
  it("stores anonymous proposals as pending with catalog data", async () => {
    const books = new InMemoryBookRepository();
    const proposeBook = createProposeBook({
      books,
      catalog: new FakeCatalog(),
      guardHumanAction: allowAllGuard,
    });

    const result = await proposeBook({ ...baseInput, proposer: null });

    expect(result.outcome).toBe("proposed");
    expect(result.book.status).toBe("pending");
    expect(result.book.title).toBe(catalogEntry().title);
  });

  it("publishes directly when a moderator proposes", async () => {
    const proposeBook = createProposeBook({
      books: new InMemoryBookRepository(),
      catalog: new FakeCatalog(),
      guardHumanAction: allowAllGuard,
    });

    const result = await proposeBook({ ...baseInput, proposer: { userId: 7, role: "moderator" } });

    expect(result.outcome).toBe("published");
    expect(result.book.status).toBe("approved");
  });

  it("returns the existing book instead of duplicating it", async () => {
    const books = new InMemoryBookRepository();
    books.seed("rejected", { openLibraryWorkKey: "OL274505W" });
    const proposeBook = createProposeBook({
      books,
      catalog: new FakeCatalog(),
      guardHumanAction: allowAllGuard,
    });

    const result = await proposeBook({ ...baseInput, proposer: null });

    expect(result.outcome).toBe("already_exists");
    expect(books.books).toHaveLength(1);
  });

  it("rejects malformed work keys before running bot checks", async () => {
    const guard = vi.fn<GuardHumanAction>(allowAllGuard);
    const proposeBook = createProposeBook({
      books: new InMemoryBookRepository(),
      catalog: new FakeCatalog(),
      guardHumanAction: guard,
    });

    await expect(
      proposeBook({ ...baseInput, workKey: "../../etc", proposer: null }),
    ).rejects.toMatchObject({ code: "invalid_work_key" });
    expect(guard).not.toHaveBeenCalled();
  });

  it("applies per-user limits to signed-in proposers and per-device limits otherwise", async () => {
    const guard = vi.fn<GuardHumanAction>(allowAllGuard);
    const proposeBook = createProposeBook({
      books: new InMemoryBookRepository(),
      catalog: new FakeCatalog([]),
      guardHumanAction: guard,
    });

    await proposeBook({ ...baseInput, proposer: { userId: 9, role: "member" } }).catch(() => null);
    await proposeBook({ ...baseInput, proposer: null }).catch(() => null);

    expect(guard.mock.calls[0]?.[0].rateLimits[0]?.key).toBe("propose:user:9");
    expect(guard.mock.calls[1]?.[0].rateLimits[0]?.key).toBe("propose:visitor:device-1");
  });

  it("fails when the catalog does not know the work", async () => {
    const proposeBook = createProposeBook({
      books: new InMemoryBookRepository(),
      catalog: new FakeCatalog([]),
      guardHumanAction: allowAllGuard,
    });

    await expect(proposeBook({ ...baseInput, proposer: null })).rejects.toMatchObject({
      code: "book_not_found_in_catalog",
    });
  });

  it("requires the device cookie for anonymous proposals", async () => {
    const guard = vi.fn<GuardHumanAction>(allowAllGuard);
    const proposeBook = createProposeBook({
      books: new InMemoryBookRepository(),
      catalog: new FakeCatalog(),
      guardHumanAction: guard,
    });

    await expect(
      proposeBook({ ...baseInput, visitorHash: null, proposer: null }),
    ).rejects.toMatchObject({ code: "cookie_consent_required" });
    expect(guard).not.toHaveBeenCalled();
  });
});

"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { CatalogEntry } from "@/books/domain/book";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/bot-protection/presentation/turnstile-widget";
import { idleActionState, type ActionState } from "@/shared/ui/action-state";
import { buttonClasses } from "@/shared/ui/button";
import { cn } from "@/shared/ui/cn";
import { BookCover } from "./book-cover";
import { formatAuthors } from "./format";
import { proposeBookAction } from "./propose-book.actions";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; results: CatalogEntry[] }
  | { status: "error"; message: string };

const SEARCH_DEBOUNCE_MS = 450;

export function ProposeBookForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const [selected, setSelected] = useState<CatalogEntry | null>(null);
  const [verified, setVerified] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const [state, formAction, pending] = useActionState(
    async (previous: ActionState, formData: FormData) => {
      const result = await proposeBookAction(previous, formData);
      // Turnstile tokens are single use, so every attempt needs a fresh challenge.
      turnstileRef.current?.reset();
      if (result.status === "success") setSelected(null);
      return result;
    },
    idleActionState,
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setSearch({ status: "loading" });
      try {
        const response = await fetch(`/api/books/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const body = (await response.json()) as { results?: CatalogEntry[]; error?: string };
        if (!response.ok) {
          setSearch({ status: "error", message: body.error ?? "La búsqueda falló." });
          return;
        }
        setSearch({ status: "done", results: body.results ?? [] });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSearch({ status: "error", message: "No pudimos conectar con el catálogo." });
        }
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label htmlFor="book-search" className="text-sm font-medium text-ink-200">
          Busca el libro por título o autor
        </label>
        <input
          id="book-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (event.target.value.trim().length < 2) setSearch({ status: "idle" });
          }}
          placeholder="Ej. Cien años de soledad"
          autoComplete="off"
          maxLength={100}
          className="w-full rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-base text-paper placeholder:text-ink-500 focus:border-ink-400 focus:outline-none"
        />
        <p className="text-xs text-ink-500">
          Los datos vienen de Open Library, así evitamos duplicados y errores de escritura.
        </p>
      </div>

      <SearchResults
        search={search}
        selectedKey={selected?.workKey ?? null}
        onSelect={(entry) => setSelected(entry)}
      />

      {selected && (
        <form
          action={formAction}
          className="flex flex-col gap-5 rounded-2xl border border-ink-700 bg-ink-900 p-5"
        >
          <div className="flex gap-4">
            <BookCover
              coverId={selected.coverId}
              title={selected.title}
              className="w-20 shrink-0"
            />
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-widest text-ink-500">Vas a proponer</p>
              <p className="font-serif text-xl text-paper">{selected.title}</p>
              <p className="text-sm text-ink-400">
                {formatAuthors(selected.authors)}
                {selected.firstPublishYear ? ` · ${selected.firstPublishYear}` : ""}
              </p>
            </div>
          </div>
          <input type="hidden" name="workKey" value={selected.workKey} />
          <div aria-hidden="true" className="absolute left-[-10000px] h-px w-px overflow-hidden">
            <label>
              No llenes este campo
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <TurnstileWidget
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            action="propose_book"
            onTokenChange={(token) => setVerified(Boolean(token))}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending || !verified}
              className={buttonClasses("primary")}
            >
              {pending ? "Enviando…" : "Enviar propuesta"}
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className={buttonClasses("ghost")}
            >
              Elegir otro
            </button>
          </div>
        </form>
      )}

      {state.status !== "idle" && (
        <p
          role="status"
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            state.status === "success"
              ? "border-success/40 text-success"
              : "border-danger/40 text-danger",
          )}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

function SearchResults({
  search,
  selectedKey,
  onSelect,
}: {
  search: SearchState;
  selectedKey: string | null;
  onSelect: (entry: CatalogEntry) => void;
}) {
  if (search.status === "idle") return null;
  if (search.status === "loading") {
    return <p className="text-sm text-ink-400">Buscando…</p>;
  }
  if (search.status === "error") {
    return (
      <p role="alert" className="text-sm text-danger">
        {search.message}
      </p>
    );
  }
  if (search.results.length === 0) {
    return (
      <p className="text-sm text-ink-400">No encontramos resultados. Prueba con otro término.</p>
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-ink-800 rounded-2xl border border-ink-800">
      {search.results.map((entry) => (
        <li key={entry.workKey}>
          <button
            type="button"
            onClick={() => onSelect(entry)}
            aria-pressed={selectedKey === entry.workKey}
            className={cn(
              "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-ink-850",
              selectedKey === entry.workKey && "bg-ink-850",
            )}
          >
            <BookCover coverId={entry.coverId} title={entry.title} className="w-10 shrink-0" />
            <span className="flex flex-col">
              <span className="font-serif text-base text-paper">{entry.title}</span>
              <span className="text-sm text-ink-400">
                {formatAuthors(entry.authors)}
                {entry.firstPublishYear ? ` · ${entry.firstPublishYear}` : ""}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

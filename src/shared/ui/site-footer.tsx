export function SiteFooter() {
  return (
    <footer className="border-t border-ink-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Club de lectura <span className="text-ink-300">Non Soma</span> con{" "}
          <a
            href="https://kick.com/elmune"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-300 underline-offset-4 hover:underline"
          >
            El Muñe
          </a>
          .
        </p>
        <p>Proyecto comunitario de código abierto · Licencia MIT</p>
      </div>
    </footer>
  );
}

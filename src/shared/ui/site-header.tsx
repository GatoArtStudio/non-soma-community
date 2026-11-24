import Link from "next/link";
import { Suspense } from "react";
import { UserMenu } from "@/authentication/presentation/user-menu";
import { LogoMark } from "./logo";

const NAVIGATION = [
  { href: "/libros", label: "Libros" },
  { href: "/proponer", label: "Proponer" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="hidden font-serif text-lg leading-none tracking-tight min-[400px]:inline">
              Non Soma <span className="hidden text-ink-400 sm:inline">Community</span>
            </span>
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-0.5 sm:gap-1">
            {NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-2.5 py-1.5 text-sm sm:px-3 text-ink-300 transition-colors hover:bg-ink-850 hover:text-paper"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <Suspense fallback={<div className="h-9 w-28 animate-pulse rounded-full bg-ink-850" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}

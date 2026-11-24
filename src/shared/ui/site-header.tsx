import Link from "next/link";
import { Suspense } from "react";
import { UserMenu } from "@/authentication/presentation/user-menu";
import { NavLink, StaticNavLink } from "./nav-link";

const NAVIGATION = [
  { href: "/libros", label: "Libros" },
  { href: "/proponer", label: "Proponer" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="flex min-h-11 shrink-0 items-center whitespace-nowrap font-serif text-lg leading-none tracking-tight"
          >
            Non Soma<span className="hidden text-ink-400 sm:inline">&nbsp;Community</span>
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-0.5 sm:gap-1">
            <Suspense
              fallback={NAVIGATION.map((item) => (
                <StaticNavLink key={item.href} href={item.href}>
                  {item.label}
                </StaticNavLink>
              ))}
            >
              {NAVIGATION.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </Suspense>
          </nav>
        </div>
        <Suspense fallback={<div className="h-9 w-28 animate-pulse rounded-full bg-ink-850" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}

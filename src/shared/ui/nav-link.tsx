"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./cn";

interface NavLinkProps {
  href: string;
  children: string;
  exact?: boolean;
}

const baseClasses =
  "inline-flex min-h-9 items-center rounded-full px-2.5 text-sm transition-colors duration-150 pointer-coarse:min-h-11 sm:px-3";
const idleClasses = "text-ink-300 hover:bg-ink-850 hover:text-paper";

export function NavLink({ href, children, exact = false }: NavLinkProps) {
  const pathname = usePathname();
  const current = pathname === href || (!exact && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(baseClasses, current ? "bg-ink-850 text-paper" : idleClasses)}
    >
      {children}
    </Link>
  );
}

/** Same link without the current-page state, for the prerendered shell before the URL is known. */
export function StaticNavLink({ href, children }: Omit<NavLinkProps, "exact">) {
  return (
    <Link href={href} className={cn(baseClasses, idleClasses)}>
      {children}
    </Link>
  );
}

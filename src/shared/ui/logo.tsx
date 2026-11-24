import { cn } from "./cn";

/** Placeholder mark: a white open book on black, matching the podcast logo. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <rect width="32" height="32" rx="7" fill="#050505" />
      <path d="M6 9.5c3.6-.9 7-.4 10 1.6v13c-3-2-6.4-2.5-10-1.6v-13Z" fill="#f4f1ea" />
      <path d="M26 9.5c-3.6-.9-7-.4-10 1.6v13c3-2 6.4-2.5 10-1.6v-13Z" fill="#d6d6d6" />
    </svg>
  );
}

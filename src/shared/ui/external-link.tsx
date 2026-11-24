import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import { ArrowUpRightIcon } from "./icons";

/** Opens in a new tab and says so, visually and to screen readers. */
export function ExternalLink({
  children,
  className,
  showIcon = true,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> & {
  children: ReactNode;
  showIcon?: boolean;
}) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {children}
      {showIcon && <ArrowUpRightIcon className="size-3.5 shrink-0 opacity-70" />}
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  );
}

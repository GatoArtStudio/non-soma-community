import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-paper text-ink-950 hover:bg-ink-200",
  secondary: "border border-ink-600 text-paper hover:border-ink-400 hover:bg-ink-850",
  ghost: "text-ink-300 hover:text-paper hover:bg-ink-850",
  danger: "border border-danger/50 text-danger hover:bg-danger/10",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string): string {
  return cn(
    "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium pointer-coarse:min-h-11",
    "transition-[color,background-color,border-color,scale] duration-150 ease-(--ease-out)",
    "active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
    variantClasses[variant],
    className,
  );
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}

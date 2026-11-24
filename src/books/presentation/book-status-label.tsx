import type { BookStatus } from "@/books/domain/book-status";
import { cn } from "@/shared/ui/cn";

const LABELS: Record<BookStatus, string> = {
  pending: "Pendiente",
  approved: "Recomendado",
  rejected: "Rechazado",
  reading: "Leyendo ahora",
  read: "Leído",
};

export function bookStatusLabel(status: BookStatus): string {
  return LABELS[status];
}

export function BookStatusLabel({ status, className }: { status: BookStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "reading" && "bg-paper text-ink-950",
        status === "read" && "border border-ink-500 text-ink-200",
        status === "approved" && "border border-ink-700 text-ink-300",
        status === "pending" && "border border-dashed border-ink-500 text-ink-300",
        status === "rejected" && "border border-danger/40 text-danger",
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}

import Image from "next/image";
import { cn } from "@/shared/ui/cn";

const SIZES = { M: "(max-width: 640px) 45vw, 200px", L: "(max-width: 768px) 70vw, 320px" };

export function coverUrl(coverId: number, size: "M" | "L" = "M"): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export function BookCover({
  coverId,
  title,
  size = "M",
  priority,
  className,
}: {
  coverId: number | null;
  title: string;
  size?: "M" | "L";
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[2/3] overflow-hidden rounded-md bg-ink-800 ring-1 ring-ink-700",
        className,
      )}
    >
      {coverId ? (
        <Image
          src={coverUrl(coverId, size)}
          alt={`Portada de ${title}`}
          fill
          sizes={SIZES[size]}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-4 text-center font-serif text-lg text-ink-300">
          {title}
        </div>
      )}
    </div>
  );
}

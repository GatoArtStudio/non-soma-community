import Image from "next/image";
import Link from "next/link";
import { canModerate } from "@/moderators/domain/role";
import { buttonClasses } from "@/shared/ui/button";
import { KickIcon } from "@/shared/ui/icons";
import { getViewer } from "./viewer";

export async function UserMenu() {
  const { user, role } = await getViewer();

  if (!user) {
    return <KickLoginLink compact />;
  }

  return (
    <div className="flex items-center gap-2">
      {canModerate(role) && (
        <Link href="/panel" className={buttonClasses("secondary", "py-1.5")}>
          Panel
        </Link>
      )}
      <span className="hidden items-center gap-2 text-sm text-ink-300 sm:flex">
        {user.avatarUrl && (
          <Image
            src={user.avatarUrl}
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-full object-cover"
          />
        )}
        @{user.username}
      </span>
      <form action="/api/auth/kick/logout" method="post">
        <button type="submit" className={buttonClasses("ghost", "py-1.5")}>
          Salir
        </button>
      </form>
    </div>
  );
}

export function KickLoginLink({
  returnTo,
  compact = false,
}: {
  returnTo?: string;
  /** Shortens the label on narrow screens, for the crowded header. */
  compact?: boolean;
}) {
  const href = returnTo
    ? `/api/auth/kick/login?returnTo=${encodeURIComponent(returnTo)}`
    : "/api/auth/kick/login";
  return (
    // A plain anchor: the login route answers with an external redirect, which should not be prefetched.
    <a href={href} className={buttonClasses("primary")}>
      <KickIcon className="size-4" />
      {compact ? (
        <span>
          Entrar<span className="hidden sm:inline"> con Kick</span>
        </span>
      ) : (
        "Entrar con Kick"
      )}
    </a>
  );
}

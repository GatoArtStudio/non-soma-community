import Image from "next/image";
import Link from "next/link";
import { canModerate } from "@/moderators/domain/role";
import { buttonClasses } from "@/shared/ui/button";
import { getViewer } from "./viewer";

export async function UserMenu() {
  const { user, role } = await getViewer();

  if (!user) {
    return <KickLoginLink />;
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

export function KickLoginLink({ returnTo }: { returnTo?: string }) {
  const href = returnTo
    ? `/api/auth/kick/login?returnTo=${encodeURIComponent(returnTo)}`
    : "/api/auth/kick/login";
  return (
    // A plain anchor: the login route answers with an external redirect, which should not be prefetched.
    <a href={href} className={buttonClasses("primary", "py-1.5")}>
      <KickIcon />
      <span>
        Entrar<span className="hidden sm:inline"> con Kick</span>
      </span>
    </a>
  );
}

function KickIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M3 3h6v4.5h1.5V6H12V4.5h1.5V3H21v6h-1.5v1.5H18V12h-1.5v1.5H18V15h1.5v1.5H21V21h-7.5v-1.5H12V18h-1.5v-1.5H9V21H3V3Z"
      />
    </svg>
  );
}

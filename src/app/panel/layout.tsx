import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelShell } from "@/moderation/presentation/panel-shell";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <Suspense
      fallback={<div aria-hidden="true" className="h-64 animate-pulse rounded-3xl bg-ink-900" />}
    >
      <PanelShell>{children}</PanelShell>
    </Suspense>
  );
}

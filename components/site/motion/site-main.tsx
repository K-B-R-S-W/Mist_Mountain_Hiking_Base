"use client";

/**
 * Thin client boundary around the site's single <main>. Its only job is to
 * hand a live element ref to CurtainProvider (via registerMain) so the
 * curtain's holding -> revealing transition can scroll-reset and focus the
 * new page's content (FR-010) — the ref callback itself needs a hook, so
 * it can't live in the (site) layout's Server Component directly.
 */

import type { ReactNode } from "react";
import { useCurtain } from "@/lib/motion/curtain-context";

export function SiteMain({ children, className }: { children: ReactNode; className?: string }) {
  const { registerMain } = useCurtain();

  return (
    <main ref={registerMain} tabIndex={-1} className={className}>
      {children}
    </main>
  );
}

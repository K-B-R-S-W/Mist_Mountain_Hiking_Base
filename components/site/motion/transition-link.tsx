"use client";

/**
 * Drop-in replacement for next/link on internal public-site navigation.
 * Renders a real <Link> under the hood (keeps prefetching, right-click
 * "open in new tab", crawler semantics, and native middle-click behavior
 * for free) and only intercepts the click after every bypass guard below
 * has been checked — see spec-page-curtain-transitions.md FR-006/FR-007/
 * FR-011 and plan-page-curtain-transitions.md's TransitionLink contract.
 *
 * Guard order (first match wins, all others fall through to default link
 * behavior):
 *   1. modifier key / middle-click / not-a-plain-left-click -> bypass
 *   2. href is the current route                            -> no-op
 *   3. href is external (not a same-origin internal path)    -> bypass
 *   4. otherwise                                              -> intercept
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useCurtain } from "@/lib/motion/curtain-context";

function isInternalHref(href: string): boolean {
  // Real call sites only ever pass internal paths (e.g. "/rooms"); this is
  // a defensive check, not the primary mechanism — external links stay
  // plain <a> tags at every call site per FR-007.
  return href.startsWith("/") && !href.startsWith("//");
}

type TransitionLinkProps = {
  href: string;
  /** Exact string shown centered on the curtain while it covers the
   *  screen. Must be the destination page's name — never derived from the
   *  URL — so dynamic destinations (e.g. a specific room) can pass the
   *  real entity name. */
  label: string;
  children: ReactNode;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

export function TransitionLink({ href, label, children, className, onClick, ...rest }: TransitionLinkProps) {
  const pathname = usePathname();
  const { requestNavigation } = useCurtain();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    // Guard 1: modifier keys, middle-click, or any non-plain-left-click —
    // let the browser handle it natively (new tab, new window, etc).
    const isModifiedClick =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (isModifiedClick) return;

    // Guard 1b: explicit target="_blank" (or any non-self target) always
    // bypasses, same reasoning as above.
    if (rest.target && rest.target !== "_self") return;

    // Guard 2: already on this route — no-op, never trigger a cycle.
    if (href === pathname) {
      event.preventDefault();
      return;
    }

    // Guard 3: not an internal path — behave like a normal link.
    if (!isInternalHref(href)) return;

    // All guards clear — intercept and drive the curtain instead.
    event.preventDefault();
    requestNavigation(href, label);
  }

  return (
    <Link href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

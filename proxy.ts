import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

/**
 * Proxy (formerly "middleware", renamed for Next.js 16) is UX only:
 * refreshes the Supabase session cookie and does a cheap redirect for the
 * obvious case (no session at all hitting /admin/*).
 *
 * It is NOT the security boundary — see CVE-2025-29927. Every admin
 * Server Action independently calls requireAdmin() before touching data.
 * If this were ever bypassed, nothing more privileged than "you can see
 * the admin shell load" is exposed; every real read/write still checks
 * auth + admin_users membership itself via RLS and requireAdmin().
 */
export async function proxy(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // getUser() re-validates the token against Supabase (not just reads the
  // cookie), unlike getSession(). Using getSession() here caused redirect
  // loops: a stale/expired cookie reads as "logged in" to middleware but
  // fails the stricter getUser() check in admin/layout.tsx, bouncing
  // /admin -> /admin/login -> /admin forever.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && !user) {
    const redirectUrl = new URL("/admin/login", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Deliberately no "isLoginRoute && user -> redirect to /admin" branch here.
  // Middleware doesn't query admin_users (kept cheap, see file header), so it
  // can't tell an admin session from a merely-authenticated one. Redirecting
  // any logged-in user away from /admin/login caused a loop for a logged-in
  // non-admin: (protected)/layout.tsx would bounce them back to /admin/login
  // for failing the admin_users check, and this branch would bounce them
  // straight back to /admin. The login page itself redirects forward once it
  // confirms — client-side — that the session actually belongs to an admin.

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
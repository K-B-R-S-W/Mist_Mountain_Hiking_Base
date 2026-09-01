import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminMobileNav } from "@/components/admin/mobile/admin-mobile-nav";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-braces: middleware already redirects unauthenticated users,
  // but this layout (and every action underneath it) checks for itself.
  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile topbar — sidebar collapses into this + a drawer below md. See components/admin/mobile/. */}
      <header className="pt-safe sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-surface px-4 py-3 md:hidden">
        <span className="font-[family-name:var(--font-fraunces)] text-primary">Mist Mountain</span>
        <AdminMobileNav items={NAV} />
      </header>

      <aside className="hidden w-56 shrink-0 border-r border-black/5 bg-surface p-6 md:block">
        <p className="mb-8 font-[family-name:var(--font-fraunces)] text-primary">
          Mist Mountain
        </p>
        <nav className="flex flex-col gap-3 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-text/80 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-background p-4 md:p-8">{children}</main>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { AdminMobileNav } from "@/components/admin/mobile/admin-mobile-nav";
import { Mountain, ExternalLink } from "lucide-react";

const ROUTE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/bookings": "Booking Inquiries",
  "/admin/rooms": "Rooms & Suites",
  "/admin/rooms/new": "New Room",
  "/admin/availability": "Room Availability",
  "/admin/gallery": "Gallery Management",
  "/admin/testimonials": "Guest Testimonials",
  "/admin/insights": "AI Concierge Insights",
  "/admin/reports": "Performance Reports",
  "/admin/activity": "Activity Audit Log",
  "/admin/media": "Media Library",
  "/admin/settings": "Global Settings",
};

export function AdminHeader({
  pendingCount = 0,
  userEmail,
  userRole = "admin",
}: {
  pendingCount?: number;
  userEmail?: string;
  userRole?: string;
}) {
  const pathname = usePathname();
  const currentTitle = ROUTE_TITLES[pathname] || (pathname.startsWith("/admin/rooms/") ? "Edit Room" : "Admin");

  return (
    <header className="sticky top-0 z-30 border-b border-black/8 bg-surface/90 backdrop-blur-md px-4 py-3 md:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex md:hidden items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-background">
              <Mountain className="h-4 w-4" />
            </div>
            <span className="font-[family-name:var(--font-fraunces)] font-semibold text-primary">
              Mist Mountain
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm">
            <Link href="/admin" className="text-muted hover:text-primary transition-colors">
              Admin
            </Link>
            <span className="text-muted/40">/</span>
            <span className="font-semibold text-text">{currentTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-background text-xs font-medium text-text hover:bg-black/4 transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3 w-3 text-muted" />
          </a>

          <div className="md:hidden">
            <AdminMobileNav pendingCount={pendingCount} userEmail={userEmail} userRole={userRole} />
          </div>
        </div>
      </div>
    </header>
  );
}

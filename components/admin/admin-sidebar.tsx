"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck2,
  BedDouble,
  CalendarRange,
  Images,
  MessageSquareQuote,
  Sparkles,
  BarChart3,
  History,
  FolderArchive,
  Settings2,
  ExternalLink,
  LogOut,
  Mountain,
} from "lucide-react";
import { adminSignOut } from "@/lib/actions/auth";
import { ConfirmButton } from "@/components/admin/ui/confirm-dialog";

interface AdminSidebarProps {
  pendingCount?: number;
  userEmail?: string;
  userRole?: string;
}

export function AdminSidebar({ pendingCount = 0, userEmail, userRole = "admin" }: AdminSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navGroups = [
    {
      title: "Operations",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        {
          href: "/admin/bookings",
          label: "Bookings",
          icon: CalendarCheck2,
          badge: pendingCount > 0 ? pendingCount : null,
        },
        { href: "/admin/rooms", label: "Rooms", icon: BedDouble },
        { href: "/admin/availability", label: "Availability", icon: CalendarRange },
        { href: "/admin/gallery", label: "Gallery", icon: Images },
        { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      ],
    },
    {
      title: "Intelligence",
      items: [
        { href: "/admin/insights", label: "AI Insights", icon: Sparkles },
        { href: "/admin/reports", label: "Reports", icon: BarChart3 },
        { href: "/admin/activity", label: "Activity Log", icon: History },
      ],
    },
    {
      title: "System",
      items: [
        { href: "/admin/media", label: "Media Library", icon: FolderArchive },
        ...(userRole === "admin"
          ? [{ href: "/admin/settings", label: "Settings", icon: Settings2 }]
          : []),
      ],
    },
  ];

  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-black/8 bg-surface p-4 md:flex min-h-screen">
      <div>
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-background shadow-xs">
            <Mountain className="h-5 w-5" />
          </div>
          <div>
            <span className="font-[family-name:var(--font-fraunces)] text-base font-semibold text-primary block leading-tight">
              Mist Mountain
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-accent block">
              Admin Portal
            </span>
          </div>
        </div>

        <nav className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
                {group.title}
              </p>
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-primary text-background shadow-xs"
                          : "text-text/80 hover:bg-black/4 hover:text-text"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            active ? "text-background" : "text-muted group-hover:text-primary"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                            active
                              ? "bg-accent text-white"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-black/8 pt-4 space-y-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-text/70 hover:bg-black/4 hover:text-primary transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-muted" />
            View Live Site
          </span>
          <span className="text-[10px] text-muted">↗</span>
        </a>

        <div className="flex items-center justify-between px-3 py-2 bg-black/2 rounded-lg border border-black/5">
          <div className="min-w-0 pr-2">
            <p className="truncate text-xs font-medium text-text">{userEmail || "Admin User"}</p>
            <p className="text-[10px] capitalize text-muted">{userRole} access</p>
          </div>
          <ConfirmButton
            confirmTitle="Sign out"
            confirmMessage="Are you sure you want to end your admin session?"
            confirmLabel="Sign out"
            variant="danger"
            onConfirm={async () => {
              await adminSignOut();
            }}
            className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 active:scale-95 transition"
          >
            <LogOut className="h-4 w-4" aria-label="Sign out" />
          </ConfirmButton>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
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

interface AdminMobileNavProps {
  pendingCount?: number;
  userEmail?: string;
  userRole?: string;
}

export function AdminMobileNav({ pendingCount = 0, userEmail, userRole = "admin" }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

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

  const isLinkActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const drawer = open ? (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close admin menu"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-primary/40 backdrop-blur-xs"
      />

      <div
        id="admin-mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Admin menu"
        className="pt-safe pb-safe absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col justify-between bg-surface px-5 py-5 shadow-2xl overflow-y-auto"
      >
        <div>
          <div className="flex items-center justify-between border-b border-black/8 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-background">
                <Mountain className="h-4 w-4" />
              </div>
              <div>
                <span className="font-[family-name:var(--font-fraunces)] font-semibold text-primary block leading-tight">
                  Mist Mountain
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-accent">
                  Admin Portal
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close admin menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary active:scale-95 hover:bg-black/5 transition"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <nav className="mt-6 space-y-6">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted/70">
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
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                          active
                            ? "bg-primary text-background"
                            : "text-text/80 active:bg-black/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
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

        <div className="border-t border-black/8 pt-4 mt-6 space-y-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-text/70 bg-black/2 active:bg-black/5 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-muted" />
              View Live Site
            </span>
            <span className="text-xs text-muted">↗</span>
          </a>

          <div className="flex items-center justify-between px-3 py-2.5 bg-black/2 rounded-lg border border-black/5">
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
              className="p-2 rounded-md text-rose-600 hover:bg-rose-50 active:scale-95 transition"
            >
              <LogOut className="h-4 w-4" aria-label="Sign out" />
            </ConfirmButton>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        aria-expanded={open}
        aria-controls="admin-mobile-nav-drawer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-primary active:scale-95 hover:bg-black/5 transition cursor-pointer"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {mounted ? createPortal(drawer, document.body) : null}
    </div>
  );
}

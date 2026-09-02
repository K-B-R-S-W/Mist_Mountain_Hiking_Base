import Link from "next/link";
import { getAdminDashboardSummary, getAdminBookings } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge, SourceBadge } from "@/components/admin/ui/status-badge";
import {
  CalendarCheck2,
  BedDouble,
  Images,
  MessageSquareQuote,
  FolderArchive,
  Sparkles,
  ArrowRight,
  Plus,
  CalendarRange,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [summary, bookings, unansweredCountRes, leadsCountRes] = await Promise.all([
    getAdminDashboardSummary(),
    getAdminBookings(),
    supabase
      .from("chat_unanswered_logs")
      .select("id", { count: "exact", head: true })
      .eq("is_resolved", false),
    supabase
      .from("chat_leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  const recentBookings = bookings.slice(0, 5);
  const unansweredCount = unansweredCountRes.count ?? 0;
  const newLeadsCount = leadsCountRes.count ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/8 pb-5">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
            Executive Overview
          </h1>
          <p className="mt-1 text-sm text-muted">
            Live operational pulse across reservations, guest experiences, and property inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/bookings" className="btn-primary">
            <CalendarCheck2 className="h-4 w-4" />
            <span>Manage Inquiries</span>
          </Link>
          <Link href="/admin/rooms/new" className="btn-secondary">
            <Plus className="h-4 w-4" />
            <span>New Room</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Inquiries */}
        <Link
          href="/admin/bookings"
          className="card group hover:border-accent/40 transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Pending Inquiries
            </span>
            <div
              className={`p-2 rounded-lg ${
                summary.pendingBookings > 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              <CalendarCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-semibold text-text tracking-tight">
              {summary.pendingBookings}
            </p>
            <span className="text-xs font-medium text-accent flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Review <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {summary.pendingBookings === 0
              ? "All inquiries handled"
              : "Requires guest follow-up"}
          </p>
        </Link>

        {/* Room Inventory */}
        <Link
          href="/admin/rooms"
          className="card group hover:border-primary/40 transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Room Inventory
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BedDouble className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-semibold text-text tracking-tight">{summary.totalRooms}</p>
            <span className="text-xs font-medium text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              View <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">{summary.visibleRooms} visible on live site</p>
        </Link>

        {/* AI Concierge Intelligence */}
        <Link
          href="/admin/insights"
          className="card group hover:border-teal-500/40 transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              AI Concierge
            </span>
            <div className="p-2 rounded-lg bg-teal-100 text-teal-800">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-semibold text-text tracking-tight">
              {unansweredCount + newLeadsCount}
            </p>
            <span className="text-xs font-medium text-teal-800 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Insights <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {unansweredCount} questions · {newLeadsCount} new leads
          </p>
        </Link>

        {/* Guest Testimonials */}
        <Link
          href="/admin/testimonials"
          className="card group hover:border-purple-500/40 transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Testimonials
            </span>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
              <MessageSquareQuote className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-semibold text-text tracking-tight">
              {summary.approvedTestimonials}
            </p>
            <span className="text-xs font-medium text-purple-800 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Moderate <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Approved guest quotes & Google reviews</p>
        </Link>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="rounded-xl border border-black/8 bg-surface p-5 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          Quick Management Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <Link
            href="/admin/bookings"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-black/6 bg-background hover:bg-black/3 hover:border-black/15 transition-all text-center gap-1.5"
          >
            <CalendarCheck2 className="h-5 w-5 text-accent" />
            <span className="text-xs font-medium text-text">Inquiries</span>
          </Link>
          <Link
            href="/admin/availability"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-black/6 bg-background hover:bg-black/3 hover:border-black/15 transition-all text-center gap-1.5"
          >
            <CalendarRange className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-text">Availability</span>
          </Link>
          <Link
            href="/admin/rooms/new"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-black/6 bg-background hover:bg-black/3 hover:border-black/15 transition-all text-center gap-1.5"
          >
            <Plus className="h-5 w-5 text-emerald-700" />
            <span className="text-xs font-medium text-text">Add Room</span>
          </Link>
          <Link
            href="/admin/gallery"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-black/6 bg-background hover:bg-black/3 hover:border-black/15 transition-all text-center gap-1.5"
          >
            <Images className="h-5 w-5 text-teal-700" />
            <span className="text-xs font-medium text-text">Gallery ({summary.visibleGalleryImages})</span>
          </Link>
          <Link
            href="/admin/media"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-black/6 bg-background hover:bg-black/3 hover:border-black/15 transition-all text-center gap-1.5 col-span-2 sm:col-span-1"
          >
            <FolderArchive className="h-5 w-5 text-purple-700" />
            <span className="text-xs font-medium text-text">Media ({summary.mediaLibrarySize})</span>
          </Link>
        </div>
      </div>

      {/* Recent Bookings Feed */}
      <div className="rounded-xl border border-black/8 bg-surface p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-black/8 pb-3 mb-4">
          <div>
            <h2 className="font-semibold text-base text-text">Recent Inquiries</h2>
            <p className="text-xs text-muted">Latest guest booking requests and inquiries</p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            View all ({bookings.length}) <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No inquiries received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted border-b border-black/6">
                <tr>
                  <th className="py-2.5 px-3">Guest</th>
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Dates</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/4">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-black/2 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-text">{b.guestName}</p>
                      <p className="text-xs text-muted">{b.email}</p>
                    </td>
                    <td className="py-3 px-3 font-medium text-text">{b.roomName || "Any Room"}</td>
                    <td className="py-3 px-3 text-xs text-muted whitespace-nowrap">
                      {b.checkIn && b.checkOut ? `${b.checkIn} → ${b.checkOut}` : "Dates flexible"}
                    </td>
                    <td className="py-3 px-3">
                      <SourceBadge source={b.source || "direct"} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href="/admin/bookings"
                        className="btn-secondary text-xs px-2.5 py-1"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

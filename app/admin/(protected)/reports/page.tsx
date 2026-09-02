import { Suspense } from "react";
import { getOccupancyRate, getRevenueSummary, getSourceBreakdown } from "@/lib/repositories";
import { DateRangePicker } from "@/components/admin/reports/DateRangePicker";
import { BarChart3, TrendingUp, DollarSign, Users, Globe, Phone, Bot, CheckCircle } from "lucide-react";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  let from = params.from as string;
  let to = params.to as string;

  if (!from || !to) {
    const now = new Date();
    from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  }

  const [occupancy, revenue, sourceBreakdown] = await Promise.all([
    getOccupancyRate(from, to),
    getRevenueSummary(from, to),
    getSourceBreakdown(from, to),
  ]);

  const maxSource = Math.max(
    sourceBreakdown.direct,
    sourceBreakdown.phone,
    sourceBreakdown.booking_com,
    sourceBreakdown.chatbot || 0,
    1
  );

  const totalBookingsCount =
    sourceBreakdown.direct +
    sourceBreakdown.phone +
    sourceBreakdown.booking_com +
    (sourceBreakdown.chatbot || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
            Performance & Revenue Reports
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track room-night occupancy, channel breakdown, and lodging revenue across custom date ranges.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="h-14 animate-pulse rounded-xl bg-surface/50 border border-black/5" />}>
        <DateRangePicker />
      </Suspense>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Occupancy Rate Card */}
        <article className="card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Occupancy Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-semibold text-text tracking-tight tabular-nums">
                {occupancy.rate}%
              </p>
              <span className="text-xs text-muted">
                {occupancy.occupiedRoomNights} of {occupancy.totalRoomNights} room-nights
              </span>
            </div>

            <div className="w-full bg-black/6 rounded-full h-3 overflow-hidden border border-black/5">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, occupancy.rate)}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-muted pt-2 border-t border-black/6">
            Calculated over active suites during the selected window ({from} to {to}).
          </p>
        </article>

        {/* Revenue Card */}
        <article className="card p-5 space-y-4 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Lodging Revenue Summary
            </span>
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-muted">LKR</span>
            <p className="text-3xl font-semibold text-text tracking-tight tabular-nums">
              {revenue.total.toLocaleString()}
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-black/6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Revenue Breakdown by Room
            </p>

            {revenue.byRoom.length === 0 ? (
              <p className="text-xs text-muted py-2">No room revenue recorded in this period.</p>
            ) : (
              <div className="space-y-2.5">
                {revenue.byRoom.map((r) => {
                  const pct = revenue.total > 0 ? (r.revenue / revenue.total) * 100 : 0;

                  return (
                    <div key={r.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-text truncate">{r.name}</span>
                        <span className="text-text tabular-nums">
                          LKR {r.revenue.toLocaleString()}{" "}
                          <span className="text-muted text-[10px]">({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-black/6 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-accent h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </article>

        {/* Booking Sources Distribution */}
        <article className="card p-5 space-y-4 md:col-span-2 lg:col-span-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Reservation Channels ({totalBookingsCount} total bookings)
              </span>
              <p className="text-xs text-muted mt-0.5">
                Distribution of reservations by acquisition channel.
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
            {/* Direct */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-emerald-700" />
                  Direct Site
                </span>
                <span className="text-base tabular-nums">{sourceBreakdown.direct}</span>
              </div>
              <div className="w-full bg-emerald-200/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${(sourceBreakdown.direct / maxSource) * 100}%` }}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-900">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-purple-700" />
                  Phone / Direct
                </span>
                <span className="text-base tabular-nums">{sourceBreakdown.phone}</span>
              </div>
              <div className="w-full bg-purple-200/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${(sourceBreakdown.phone / maxSource) * 100}%` }}
                />
              </div>
            </div>

            {/* Booking.com */}
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-blue-700" />
                  Booking.com
                </span>
                <span className="text-base tabular-nums">{sourceBreakdown.booking_com}</span>
              </div>
              <div className="w-full bg-blue-200/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${(sourceBreakdown.booking_com / maxSource) * 100}%` }}
                />
              </div>
            </div>

            {/* Chatbot */}
            <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-teal-900">
                <span className="flex items-center gap-1.5">
                  <Bot className="h-4 w-4 text-teal-700" />
                  AI Concierge
                </span>
                <span className="text-base tabular-nums">{sourceBreakdown.chatbot || 0}</span>
              </div>
              <div className="w-full bg-teal-200/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full"
                  style={{ width: `${((sourceBreakdown.chatbot || 0) / maxSource) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import { getOccupancyRate, getRevenueSummary, getSourceBreakdown } from "@/lib/repositories";
import { DateRangePicker } from "@/components/admin/reports/DateRangePicker";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  let from = params.from as string;
  let to = params.to as string;

  // Defaults to this month
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

  const maxSource = Math.max(sourceBreakdown.direct, sourceBreakdown.phone, sourceBreakdown.booking_com, 1);

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-primary">
        Reports
      </h1>
      <p className="text-sm text-muted">
        Occupancy and revenue performance over time.
      </p>

      <Suspense fallback={<div className="h-10 animate-pulse rounded bg-surface/50" />}>
        <DateRangePicker />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <article className="card">
          <p className="eyebrow">OCCUPANCY RATE</p>
          <p className="mt-2 text-3xl font-medium">{occupancy.rate}%</p>
          <p className="text-sm text-muted mt-1">
            {occupancy.occupiedRoomNights} of {occupancy.totalRoomNights} room-nights
          </p>
        </article>

        <article className="card lg:col-span-2">
          <p className="eyebrow">REVENUE</p>
          <p className="mt-2 text-3xl font-medium">
            LKR {revenue.total.toLocaleString()}
          </p>
          <div className="mt-4 space-y-2">
            {revenue.byRoom.map((r) => (
              <div key={r.name} className="flex justify-between text-sm">
                <span className="text-muted">{r.name}</span>
                <span className="font-medium">LKR {r.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card md:col-span-2 lg:col-span-3">
          <p className="eyebrow">BOOKING SOURCES</p>
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm text-muted">Direct</span>
              <div className="flex-1 bg-surface border border-black/5 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-primary h-full"
                  style={{ width: `${(sourceBreakdown.direct / maxSource) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm">{sourceBreakdown.direct}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm text-muted">Phone</span>
              <div className="flex-1 bg-surface border border-black/5 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-accent h-full"
                  style={{ width: `${(sourceBreakdown.phone / maxSource) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm">{sourceBreakdown.phone}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-24 text-sm text-muted">Booking.com</span>
              <div className="flex-1 bg-surface border border-black/5 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-secondary h-full"
                  style={{ width: `${(sourceBreakdown.booking_com / maxSource) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm">{sourceBreakdown.booking_com}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

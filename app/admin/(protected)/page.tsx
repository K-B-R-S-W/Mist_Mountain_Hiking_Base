import { getAdminDashboardSummary } from "@/lib/repositories";

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-primary">
        Dashboard
      </h1>
      <p className="text-sm text-muted">Operational snapshot across public and admin surfaces.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="card">
          <p className="text-sm text-muted">Rooms</p>
          <p className="mt-2 text-3xl">{summary.totalRooms}</p>
          <p className="text-xs text-muted">{summary.visibleRooms} visible</p>
        </article>
        <article className="card">
          <p className="text-sm text-muted">Pending inquiries</p>
          <p className="mt-2 text-3xl">{summary.pendingBookings}</p>
        </article>
        <article className="card">
          <p className="text-sm text-muted">Gallery images</p>
          <p className="mt-2 text-3xl">{summary.visibleGalleryImages}</p>
          <p className="text-xs text-muted">currently visible</p>
        </article>
        <article className="card">
          <p className="text-sm text-muted">Approved testimonials</p>
          <p className="mt-2 text-3xl">{summary.approvedTestimonials}</p>
        </article>
        <article className="card">
          <p className="text-sm text-muted">Media library</p>
          <p className="mt-2 text-3xl">{summary.mediaLibrarySize}</p>
          <p className="text-xs text-muted">active files</p>
        </article>
      </div>
    </div>
  );
}

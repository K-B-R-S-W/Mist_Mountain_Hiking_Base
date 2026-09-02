"use client";

import { useState, useTransition, useMemo } from "react";
import type { BookingInquiry } from "@/lib/types/domain";
import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from "@/lib/constants";
import { updateBookingStatus } from "@/lib/actions/update-booking-status";
import { StatusBadge, SourceBadge } from "@/components/admin/ui/status-badge";
import { useToast } from "@/components/admin/ui/toast";
import {
  Search,
  Download,
  Phone,
  Mail,
  Calendar,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  CalendarCheck2,
} from "lucide-react";

const STATUS_OPTIONS = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONTACTED,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
] as const;

type StatusFilter = "all" | (typeof STATUS_OPTIONS)[number];

export function BookingsManager({ initialBookings }: { initialBookings: BookingInquiry[] }) {
  const toast = useToast();
  const [bookings, setBookings] = useState<BookingInquiry[]>(initialBookings);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: bookings.length };
    STATUS_OPTIONS.forEach((status) => {
      map[status] = bookings.filter((b) => b.status === status).length;
    });
    return map;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.guestName.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.roomName && b.roomName.toLowerCase().includes(q)) ||
        (b.bookingRef && b.bookingRef.toLowerCase().includes(q)) ||
        (b.message && b.message.toLowerCase().includes(q))
      );
    });
  }, [bookings, statusFilter, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: BookingInquiry["status"]) => {
    const originalBooking = bookings.find((b) => b.id === id);
    if (!originalBooking || originalBooking.status === newStatus) return;

    // Optimistic update
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    setPendingIds((prev) => ({ ...prev, [id]: true }));

    startTransition(async () => {
      try {
        const result = await updateBookingStatus({ id, status: newStatus });
        if (!result.ok) {
          // Revert on failure
          setBookings((prev) =>
            prev.map((b) => (b.id === id ? originalBooking : b))
          );
          toast.error(result.error);
        } else {
          toast.success(`Booking status updated to ${BOOKING_STATUS_LABELS[newStatus]}`);
        }
      } catch {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? originalBooking : b))
        );
        toast.error("Failed to update status.");
      } finally {
        setPendingIds((prev) => ({ ...prev, [id]: false }));
      }
    });
  };

  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      toast.info("No bookings match the current filter to export.");
      return;
    }

    const headers = [
      "ID",
      "Created At",
      "Guest Name",
      "Email",
      "Phone",
      "Room",
      "Check In",
      "Check Out",
      "Guests",
      "Status",
      "Source",
      "Booking Ref",
      "Message",
    ];

    const rows = filteredBookings.map((b) => [
      b.id,
      new Date(b.createdAt).toISOString(),
      `"${b.guestName.replace(/"/g, '""')}"`,
      `"${b.email}"`,
      `"${b.phone || ""}"`,
      `"${b.roomName || "Any"}"`,
      b.checkIn || "",
      b.checkOut || "",
      b.guests || "",
      b.status,
      b.source || "direct",
      b.bookingRef || "",
      `"${(b.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mist-mountain-bookings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Bookings CSV exported.");
  };

  return (
    <div className="space-y-6">
      {/* Search & Export Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="search"
            placeholder="Search by guest, email, phone, room, ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9"
          />
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="btn-secondary shrink-0"
        >
          <Download className="h-4 w-4 text-muted" />
          <span>Export CSV ({filteredBookings.length})</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-black/8 pb-3">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            statusFilter === "all"
              ? "bg-primary text-background shadow-xs"
              : "text-muted hover:text-text hover:bg-black/4"
          }`}
        >
          All ({counts.all})
        </button>

        {STATUS_OPTIONS.map((status) => {
          const active = statusFilter === status;
          const count = counts[status] || 0;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                active
                  ? "bg-primary text-background shadow-xs"
                  : "text-muted hover:text-text hover:bg-black/4"
              }`}
            >
              <span>{BOOKING_STATUS_LABELS[status]}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  active
                    ? "bg-accent text-white"
                    : count > 0
                    ? "bg-black/8 text-text"
                    : "text-muted/60"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings View */}
      {filteredBookings.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <div className="h-12 w-12 rounded-full bg-black/4 text-muted flex items-center justify-center mx-auto">
            <CalendarCheck2 className="h-6 w-6" />
          </div>
          <p className="font-medium text-text">No bookings found</p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {searchQuery
              ? `No inquiries match "${searchQuery}". Try clearing your search.`
              : `No inquiries with status "${statusFilter}".`}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="btn-secondary text-xs mt-2"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-black/8 bg-surface shadow-xs">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-black/8 bg-black/2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-4">Guest Details</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Stay Dates</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6">
                {filteredBookings.map((booking) => {
                  const isExpanded = expandedId === booking.id;
                  const isPending = pendingIds[booking.id];

                  return (
                    <tr
                      key={booking.id}
                      className={`hover:bg-black/2 transition-colors ${
                        isExpanded ? "bg-black/1.5" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text">{booking.guestName}</span>
                          {booking.bookingRef && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 text-muted">
                              #{booking.bookingRef}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                          <a
                            href={`mailto:${booking.email}`}
                            className="inline-flex items-center gap-1 hover:text-primary transition"
                            title="Send email"
                          >
                            <Mail className="h-3 w-3" />
                            <span>{booking.email}</span>
                          </a>
                          {booking.phone && (
                            <a
                              href={`tel:${booking.phone}`}
                              className="inline-flex items-center gap-1 hover:text-primary transition"
                              title="Call phone"
                            >
                              <Phone className="h-3 w-3" />
                              <span>{booking.phone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span className="font-medium text-text">{booking.roomName ?? "Any Room"}</span>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                          <Users className="h-3 w-3" />
                          <span>{booking.guests ? `${booking.guests} guests` : "Guests: -"}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-text">
                          <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span>
                            {booking.checkIn && booking.checkOut
                              ? `${booking.checkIn} → ${booking.checkOut}`
                              : "Dates flexible"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted">
                          Inquiry: {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <SourceBadge source={booking.source || "direct"} />
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="relative inline-flex items-center">
                          <select
                            disabled={isPending}
                            value={booking.status}
                            onChange={(e) =>
                              handleStatusChange(booking.id, e.target.value as BookingInquiry["status"])
                            }
                            className="form-input py-1 pl-2 pr-7 text-xs font-medium cursor-pointer rounded-lg bg-surface border-black/15 focus:border-accent"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {BOOKING_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                          {isPending && (
                            <Loader2 className="absolute right-2 h-3.5 w-3.5 animate-spin text-accent pointer-events-none" />
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                          className="btn-ghost text-xs px-2 py-1 gap-1"
                          aria-label="Toggle notes"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded Drawer / Detail Section for Desktop */}
          {expandedId && (
            <div className="hidden md:block rounded-xl border border-black/8 bg-surface p-4 shadow-xs animate-in fade-in">
              {(() => {
                const b = filteredBookings.find((item) => item.id === expandedId);
                if (!b) return null;
                return (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between border-b border-black/6 pb-2">
                      <h3 className="font-semibold text-text">
                        Guest Message & Notes: {b.guestName}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setExpandedId(null)}
                        className="text-xs text-muted hover:text-text"
                      >
                        Close
                      </button>
                    </div>
                    <p className="text-text/90 italic bg-black/2 p-3 rounded-lg border border-black/5">
                      {b.message ? `"${b.message}"` : "No special message provided by guest."}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span>Booking ID: <span className="font-mono text-text">{b.id}</span></span>
                      {b.bookingRef && <span>Booking.com Ref: <span className="font-mono text-text">{b.bookingRef}</span></span>}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Mobile Card List View */}
          <div className="flex flex-col gap-3 md:hidden">
            {filteredBookings.map((booking) => {
              const isPending = pendingIds[booking.id];

              return (
                <div key={booking.id} className="card space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-base text-text">{booking.guestName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <SourceBadge source={booking.source || "direct"} />
                        {booking.bookingRef && (
                          <span className="text-[10px] font-mono px-1 rounded bg-black/5 text-muted">
                            #{booking.bookingRef}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted border-t border-b border-black/6 py-2.5">
                    <a
                      href={`mailto:${booking.email}`}
                      className="inline-flex items-center gap-1 text-primary"
                    >
                      <Mail className="h-3 w-3" />
                      <span>{booking.email}</span>
                    </a>
                    {booking.phone && (
                      <a
                        href={`tel:${booking.phone}`}
                        className="inline-flex items-center gap-1 text-primary"
                      >
                        <Phone className="h-3 w-3" />
                        <span>{booking.phone}</span>
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted block">Room</span>
                      <span className="font-medium text-text">{booking.roomName ?? "Any"}</span>
                    </div>
                    <div>
                      <span className="text-muted block">Guests</span>
                      <span className="font-medium text-text">{booking.guests ?? "-"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted block">Stay Dates</span>
                      <span className="font-medium text-text">
                        {booking.checkIn && booking.checkOut
                          ? `${booking.checkIn} → ${booking.checkOut}`
                          : "Dates flexible"}
                      </span>
                    </div>
                  </div>

                  {booking.message && (
                    <p className="text-xs italic text-muted bg-black/2 p-2.5 rounded-lg border border-black/5">
                      &ldquo;{booking.message}&rdquo;
                    </p>
                  )}

                  <div className="pt-2 border-t border-black/6 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted font-medium">Update Status:</span>
                    <div className="relative flex-1 max-w-[180px]">
                      <select
                        disabled={isPending}
                        value={booking.status}
                        onChange={(e) =>
                          handleStatusChange(booking.id, e.target.value as BookingInquiry["status"])
                        }
                        className="form-input py-1.5 text-xs font-medium cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {BOOKING_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

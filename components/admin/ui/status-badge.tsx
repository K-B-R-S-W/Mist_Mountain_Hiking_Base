import type { BookingInquiry } from "@/lib/types/domain";

type StatusType =
  | BookingInquiry["status"]
  | "new"
  | "contacted"
  | "converted"
  | "notified"
  | "expired"
  | "archived"
  | "visible"
  | "hidden"
  | "featured";

type SourceType = "direct" | "phone" | "chatbot" | "booking_com" | "google" | "manual";

const STATUS_CONFIGS: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-stone-100",
    text: "text-stone-700",
    border: "border-stone-200",
    dot: "bg-stone-500",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  new: {
    label: "New",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  converted: {
    label: "Converted",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  notified: {
    label: "Notified",
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  expired: {
    label: "Expired",
    bg: "bg-stone-100",
    text: "text-stone-600",
    border: "border-stone-200",
    dot: "bg-stone-400",
  },
  archived: {
    label: "Archived",
    bg: "bg-stone-100",
    text: "text-stone-600",
    border: "border-stone-200",
    dot: "bg-stone-400",
  },
  visible: {
    label: "Visible",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  hidden: {
    label: "Hidden",
    bg: "bg-stone-100",
    text: "text-stone-600",
    border: "border-stone-200",
    dot: "bg-stone-400",
  },
  featured: {
    label: "Featured",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
};

const SOURCE_CONFIGS: Record<SourceType, { label: string; bg: string; text: string; border: string }> = {
  direct: {
    label: "Direct Site",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  phone: {
    label: "Phone / Direct",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
  },
  chatbot: {
    label: "AI Concierge",
    bg: "bg-teal-50",
    text: "text-teal-800",
    border: "border-teal-200",
  },
  booking_com: {
    label: "Booking.com",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  google: {
    label: "Google Review",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  manual: {
    label: "Direct Quote",
    bg: "bg-stone-100",
    text: "text-stone-700",
    border: "border-stone-200",
  },
};

export function StatusBadge({ status, className = "" }: { status: StatusType | string; className?: string }) {
  const config = STATUS_CONFIGS[status.toLowerCase()] || {
    label: status,
    bg: "bg-stone-100",
    text: "text-stone-700",
    border: "border-stone-200",
    dot: "bg-stone-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function SourceBadge({ source, className = "" }: { source: SourceType | string | null | undefined; className?: string }) {
  if (!source) return null;
  const config = SOURCE_CONFIGS[source as SourceType] || {
    label: source,
    bg: "bg-stone-100",
    text: "text-stone-700",
    border: "border-stone-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
}

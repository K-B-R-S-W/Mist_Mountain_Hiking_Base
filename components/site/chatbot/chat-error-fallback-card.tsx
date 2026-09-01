"use client";

import { Phone, MessageCircle, Mail, ExternalLink, AlertTriangle } from "lucide-react";

export function ChatErrorFallbackCard({
  phone = "+94 77 123 4567",
  whatsapp = "+94 77 123 4567",
  bookingUrl,
}: {
  phone?: string;
  whatsapp?: string;
  bookingUrl?: string;
}) {
  const cleanPhone = whatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="rounded-xl border border-amber-600/30 bg-amber-50/60 p-3.5 shadow-xs text-xs space-y-2.5">
      <div className="flex items-center gap-2 text-amber-900 font-semibold">
        <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
        <span>Direct Contact Available</span>
      </div>

      <p className="text-[11px] text-amber-950 leading-relaxed">
        Our AI service is momentarily busy. Please contact our team directly through any of these channels:
      </p>

      <div className="grid grid-cols-2 gap-1.5 pt-1">
        <a
          href={`tel:${phone}`}
          className="flex items-center justify-center gap-1 rounded-lg border border-amber-300 bg-white py-1.5 text-xs font-medium text-amber-950 hover:bg-amber-100 transition"
        >
          <Phone className="h-3 w-3 text-amber-800" />
          <span>Call Us</span>
        </a>

        <a
          href={`https://wa.me/${cleanPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 rounded-lg bg-emerald-700 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 transition"
        >
          <MessageCircle className="h-3 w-3" />
          <span>WhatsApp</span>
        </a>
      </div>

      {bookingUrl ? (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#003580] py-1.5 text-xs font-medium text-white hover:bg-[#00265c] transition"
        >
          <span>Book on Booking.com</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : null}
    </div>
  );
}

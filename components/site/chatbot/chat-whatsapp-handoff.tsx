"use client";

import { MessageCircle, ExternalLink } from "lucide-react";
import { HandoffPayload } from "@/lib/chatbot/types";

export function ChatWhatsAppHandoff({ data }: { data: HandoffPayload }) {
  const cleanPhone = data.whatsappNumber.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(data.prefilledText);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  return (
    <div className="rounded-xl border border-emerald-600/30 bg-emerald-50/50 p-3.5 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div>
          <h5 className="text-xs font-bold text-emerald-950">Chat with Our Host Team</h5>
          <p className="text-[11px] text-emerald-800">Quick direct assistance via WhatsApp</p>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-emerald-900 leading-relaxed">
        {data.reason || "Prefer to speak with our front desk directly?"} We are online and happy to assist you immediately.
      </p>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition active:scale-98"
      >
        <span>Open WhatsApp Chat</span>
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

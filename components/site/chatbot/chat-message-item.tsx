"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Sparkles, Trees, User } from "lucide-react";
import { ChatMessage, CurrencyCode, RoomCardPayload } from "@/lib/chatbot/types";
import { ChatRoomCard } from "./chat-room-card";
import { ChatAttractionCard } from "./chat-attraction-card";
import { ChatItineraryCard } from "./chat-itinerary-card";
import { ChatBookingFlow } from "./chat-booking-flow";
import { ChatWaitlistCard } from "./chat-waitlist-card";
import { ChatWhatsAppHandoff } from "./chat-whatsapp-handoff";
import { ChatErrorFallbackCard } from "./chat-error-fallback-card";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMarkdownContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    // 1. First escape all raw HTML to neutralize any script/img/tag injection
    const escaped = escapeHtml(line);

    // 2. Safely apply markdown formatting on the escaped string
    let formatted = escaped
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Bullet point styling
    if (/^[\*\-]\s+/.test(line)) {
      const clean = escapeHtml(line.replace(/^[\*\-]\s+/, ""))
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      return (
        <li
          key={idx}
          className="ml-3.5 list-disc leading-relaxed"
          dangerouslySetInnerHTML={{ __html: clean }}
        />
      );
    }

    if (!line.trim()) {
      return <div key={idx} className="h-1.5" />;
    }

    return (
      <p
        key={idx}
        className="leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  });
}

export function ChatMessageItem({
  message,
  currency = "LKR",
  sessionId,
  onSelectRoom,
  onNavigate,
  onBookStay,
}: {
  message: ChatMessage;
  currency?: CurrencyCode;
  sessionId: string;
  onSelectRoom?: (room: RoomCardPayload) => void;
  onNavigate?: (href: string) => void;
  onBookStay?: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-background shadow-xs">
          <Trees className="h-4 w-4" />
        </div>
      ) : null}

      <div className={`max-w-[85%] space-y-2.5 ${isUser ? "items-end" : "items-start"}`}>
        {/* Text Message Bubble */}
        {message.content ? (
          <div
            className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
              isUser
                ? "rounded-tr-xs bg-primary text-background font-normal"
                : "rounded-tl-xs bg-surface text-text border border-black/5"
            }`}
          >
            {formatMarkdownContent(message.content)}
          </div>
        ) : null}

        {/* Embedded Rich Cards */}
        {message.cards && message.cards.length > 0 ? (
          <div className="w-full space-y-2.5 pt-1">
            {message.cards.map((card, i) => {
              if (card.type === "room") {
                return (
                  <ChatRoomCard
                    key={i}
                    room={card.data}
                    currency={currency}
                    onSelect={onSelectRoom}
                  />
                );
              }

              if (card.type === "room_list") {
                return (
                  <div key={i} className="space-y-2">
                    {card.data.map((r) => (
                      <ChatRoomCard
                        key={r.id}
                        room={r}
                        currency={currency}
                        onSelect={onSelectRoom}
                      />
                    ))}
                  </div>
                );
              }

              if (card.type === "attraction") {
                return (
                  <ChatAttractionCard
                    key={i}
                    attraction={card.data}
                    onNavigate={onNavigate}
                  />
                );
              }

              if (card.type === "itinerary") {
                return (
                  <ChatItineraryCard
                    key={i}
                    itinerary={card.data}
                    onBookStay={onBookStay}
                  />
                );
              }

              if (card.type === "booking_flow") {
                return (
                  <ChatBookingFlow
                    key={i}
                    initialDraft={card.data}
                    currency={currency}
                    sessionId={sessionId}
                  />
                );
              }

              if (card.type === "waitlist") {
                return <ChatWaitlistCard key={i} data={card.data} />;
              }

              if (card.type === "whatsapp_handoff") {
                return <ChatWhatsAppHandoff key={i} data={card.data} />;
              }

              if (card.type === "error_fallback") {
                return (
                  <ChatErrorFallbackCard
                    key={i}
                    phone={card.data.phone}
                    whatsapp={card.data.whatsapp}
                    bookingUrl={card.data.bookingUrl}
                  />
                );
              }

              if (card.type === "nav") {
                return (
                  <div
                    key={i}
                    onClick={() => onNavigate && onNavigate(card.data.href)}
                    className="cursor-pointer rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs transition hover:bg-primary/10"
                  >
                    <p className="font-semibold text-primary">{card.data.label}</p>
                    {card.data.description ? (
                      <p className="text-[11px] text-muted">{card.data.description}</p>
                    ) : null}
                  </div>
                );
              }

              return null;
            })}
          </div>
        ) : null}
      </div>

      {isUser ? (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-background shadow-xs">
          <User className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { ChatMessage, CurrencyCode, RoomCardPayload } from "@/lib/chatbot/types";
import { MistMountainLogo } from "./mist-mountain-logo";
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

function cleanPotentialJson(rawText: string): string {
  const trimmed = rawText.trim();
  // Strip code fences if model wrapped response in ```json ... ``` or ```markdown ... ```
  if (trimmed.startsWith("```")) {
    const lines = trimmed.split("\n");
    if (lines[0]?.startsWith("```")) lines.shift();
    if (lines[lines.length - 1]?.startsWith("```")) lines.pop();
    const unwrapped = lines.join("\n").trim();
    if (unwrapped.startsWith("{") && unwrapped.endsWith("}")) {
      try {
        const parsed = JSON.parse(unwrapped);
        return parsed.message || parsed.text || parsed.response || unwrapped;
      } catch {
        return unwrapped;
      }
    }
    return unwrapped;
  }

  // Strip standalone JSON object
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed.message || parsed.text || parsed.response || rawText;
    } catch {
      return rawText;
    }
  }

  return rawText;
}

function formatMarkdownContent(rawText: string) {
  const text = cleanPotentialJson(rawText);
  const lines = text.split("\n");

  return lines.map((line, idx) => {
    const trimmedLine = line.trim();

    // Horizontal Rule (--- or ***)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmedLine)) {
      return <hr key={idx} className="my-1.5 border-black/10" />;
    }

    // Heading 3 / Heading 2 / Heading 1 (###, ##, #)
    if (/^#{1,3}\s+/.test(trimmedLine)) {
      const cleanTitle = trimmedLine.replace(/^#{1,3}\s+/, "");
      const formattedTitle = escapeHtml(cleanTitle)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      return (
        <h5
          key={idx}
          className="font-[family-name:var(--font-fraunces)] font-bold text-primary pt-1 text-xs"
          dangerouslySetInnerHTML={{ __html: formattedTitle }}
        />
      );
    }

    // Bullet List (- item or * item)
    if (/^[\*\-]\s+/.test(trimmedLine)) {
      const clean = escapeHtml(trimmedLine.replace(/^[\*\-]\s+/, ""))
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      return (
        <li
          key={idx}
          className="ml-3.5 list-disc leading-relaxed text-[11.5px]"
          dangerouslySetInnerHTML={{ __html: clean }}
        />
      );
    }

    // Numbered List (1. item)
    if (/^\d+\.\s+/.test(trimmedLine)) {
      const clean = escapeHtml(trimmedLine.replace(/^\d+\.\s+/, ""))
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      return (
        <li
          key={idx}
          className="ml-3.5 list-decimal leading-relaxed text-[11.5px]"
          dangerouslySetInnerHTML={{ __html: clean }}
        />
      );
    }

    // Empty spacing line
    if (!trimmedLine) {
      return <div key={idx} className="h-1" />;
    }

    // Regular Paragraph
    const formatted = escapeHtml(line)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    return (
      <p
        key={idx}
        className="leading-relaxed text-[11.5px]"
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
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-background shadow-xs ring-1 ring-primary/10">
          <MistMountainLogo className="h-4 w-4 text-white" />
        </div>
      ) : null}

      <div className={`max-w-[85%] space-y-2.5 ${isUser ? "items-end" : "items-start"}`}>
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
                    {card.data.map((room) => (
                      <ChatRoomCard
                        key={room.id}
                        room={room}
                        currency={currency}
                        onSelect={onSelectRoom}
                      />
                    ))}
                  </div>
                );
              }

              if (card.type === "attraction") {
                return <ChatAttractionCard key={i} attraction={card.data} onNavigate={onNavigate} />;
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
                return (
                  <ChatWaitlistCard
                    key={i}
                    data={card.data}
                  />
                );
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
                    className="overflow-hidden rounded-xl border border-black/10 bg-surface p-3 shadow-xs"
                  >
                    <h5 className="font-semibold text-primary text-xs">{card.data.label}</h5>
                    {card.data.description ? (
                      <p className="mt-1 text-[11px] text-muted leading-relaxed">
                        {card.data.description}
                      </p>
                    ) : null}
                    <button
                      onClick={() => onNavigate && onNavigate(card.data.href)}
                      type="button"
                      className="mt-2 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                    >
                      Open {card.data.label} →
                    </button>
                  </div>
                );
              }

              return null;
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

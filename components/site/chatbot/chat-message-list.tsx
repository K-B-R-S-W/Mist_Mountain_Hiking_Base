"use client";

import { useEffect, useRef } from "react";
import { MistMountainLogo } from "./mist-mountain-logo";
import { ChatMessage, CurrencyCode, RoomCardPayload } from "@/lib/chatbot/types";
import { ChatMessageItem } from "./chat-message-item";
import { ChatQuickReplies } from "./chat-quick-replies";

export function ChatMessageList({
  messages,
  currency = "LKR",
  sessionId,
  isTyping = false,
  quickReplies = [],
  onSelectQuickReply,
  onSelectRoom,
  onNavigate,
  onBookStay,
}: {
  messages: ChatMessage[];
  currency?: CurrencyCode;
  sessionId: string;
  isTyping?: boolean;
  quickReplies?: string[];
  onSelectQuickReply?: (reply: string) => void;
  onSelectRoom?: (room: RoomCardPayload) => void;
  onNavigate?: (href: string) => void;
  onBookStay?: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center p-6 text-muted space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-xs">
            <MistMountainLogo className="h-7 w-7" />
          </div>
          <h4 className="font-[family-name:var(--font-fraunces)] text-base font-semibold text-primary">
            Mist Mountain AI Concierge
          </h4>
          <p className="text-xs max-w-xs leading-relaxed">
            Ask about room availability, 2 natural spring pools, Pimbura hiking circuits, or plan a custom stay!
          </p>
        </div>
      ) : null}

      {messages.map((message) => (
        <ChatMessageItem
          key={message.id}
          message={message}
          currency={currency}
          sessionId={sessionId}
          onSelectRoom={onSelectRoom}
          onNavigate={onNavigate}
          onBookStay={onBookStay}
        />
      ))}

      {isTyping ? (
        <div className="flex items-center gap-2 text-muted text-xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-xs">
            <MistMountainLogo className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1 rounded-2xl rounded-tl-xs bg-surface px-3 py-2 border border-black/5 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      ) : null}

      {quickReplies && quickReplies.length > 0 && onSelectQuickReply ? (
        <div className="pt-2">
          <ChatQuickReplies replies={quickReplies} onSelect={onSelectQuickReply} />
        </div>
      ) : null}

      <div ref={bottomRef} />
    </div>
  );
}

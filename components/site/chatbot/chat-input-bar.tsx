"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Sparkles } from "lucide-react";
import { LanguageCode } from "@/lib/chatbot/types";

export function ChatInputBar({
  onSendMessage,
  onStartVoice,
  disabled = false,
  language = "en",
}: {
  onSendMessage: (text: string) => void;
  onStartVoice?: () => void;
  disabled?: boolean;
  language?: LanguageCode;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder =
    language === "si"
      ? "ඔබගේ පණිවිඩය මෙහි ලියන්න (හෝ මයික්‍රෆෝනය ඔබන්න)..."
      : "Ask about rooms, trails, spring pools, or itineraries...";

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="border-t border-black/5 bg-surface/90 p-3 backdrop-blur">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          maxLength={2000}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="max-h-24 flex-1 resize-none rounded-xl border border-black/10 bg-background px-3.5 py-2.5 text-xs text-text placeholder:text-muted/70 focus:border-primary focus:outline-hidden disabled:opacity-50"
        />

        {onStartVoice ? (
          <button
            onClick={onStartVoice}
            type="button"
            title="Switch to Voice Chat"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-surface text-secondary hover:bg-secondary/10 hover:text-primary transition active:scale-95"
          >
            <Mic className="h-4 w-4" />
          </button>
        ) : null}

        <button
          type="submit"
          disabled={!input.trim() || disabled}
          title="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-background shadow-xs hover:bg-secondary transition active:scale-95 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

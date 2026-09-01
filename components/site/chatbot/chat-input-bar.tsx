"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic } from "lucide-react";
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
      ? "ඔබගේ පණිවිඩය මෙහි ලියන්න..."
      : "Ask about rooms, trails, spring pools...";

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 38), 100)}px`;
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
      textareaRef.current.style.height = "38px";
    }
  };

  return (
    <div className="border-t border-black/5 bg-surface/95 p-3 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="relative flex-1 flex items-center rounded-xl border border-black/10 bg-background px-3 py-1 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-2xs">
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={2000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full resize-none bg-transparent py-1.5 text-xs text-text placeholder:text-muted/70 focus:outline-hidden disabled:opacity-50 overflow-y-auto leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ minHeight: "34px", maxHeight: "100px" }}
          />
        </div>

        {onStartVoice ? (
          <button
            onClick={onStartVoice}
            type="button"
            title="Switch to Voice Mode"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-background text-secondary hover:bg-secondary/10 hover:text-primary transition-all active:scale-95 shadow-2xs"
          >
            <Mic className="h-4 w-4" />
          </button>
        ) : null}

        <button
          type="submit"
          disabled={!input.trim() || disabled}
          title="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-background shadow-xs hover:bg-secondary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

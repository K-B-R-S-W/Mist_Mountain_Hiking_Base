"use client";

import { Trees, RotateCcw, X, Mic, Volume2 } from "lucide-react";
import { CurrencyCode, LanguageCode } from "@/lib/chatbot/types";

export function ChatHeader({
  language,
  currency,
  isVoiceMode,
  onToggleLanguage,
  onToggleCurrency,
  onToggleVoiceMode,
  onResetChat,
  onClose,
}: {
  language: LanguageCode;
  currency: CurrencyCode;
  isVoiceMode: boolean;
  onToggleLanguage: () => void;
  onToggleCurrency: () => void;
  onToggleVoiceMode: () => void;
  onResetChat: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 bg-surface px-4 py-3 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-background shadow-xs">
          <Trees className="h-4 w-4" />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-fraunces)] text-sm font-semibold text-primary leading-tight">
            Mist Mountain Concierge
          </h3>
          <p className="text-[10px] text-muted leading-none">
            {language === "si" ? "සක්‍රීයයි • ස්වභාවික නවාතැන්" : "Online • Mountain Retreat"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Language Toggle */}
        <button
          onClick={onToggleLanguage}
          type="button"
          title="Switch Language (English / Sinhala)"
          className="rounded-md border border-black/10 bg-background px-2 py-1 text-[11px] font-semibold text-primary hover:bg-black/5 transition"
        >
          {language === "en" ? "සිංහල" : "EN"}
        </button>

        {/* Currency Toggle */}
        <button
          onClick={onToggleCurrency}
          type="button"
          title="Switch Currency (LKR / USD)"
          className="rounded-md border border-black/10 bg-background px-1.5 py-1 text-[10px] font-semibold text-accent hover:bg-black/5 transition"
        >
          {currency}
        </button>

        {/* Voice Mode Toggle */}
        <button
          onClick={onToggleVoiceMode}
          type="button"
          title={isVoiceMode ? "Switch to Text Mode" : "Start Voice Chat"}
          className={`rounded-md p-1.5 text-xs transition ${
            isVoiceMode
              ? "bg-accent text-white"
              : "text-muted hover:bg-black/5 hover:text-text"
          }`}
        >
          <Mic className="h-4 w-4" />
        </button>

        {/* New Chat Reset Button */}
        <button
          onClick={onResetChat}
          type="button"
          title="Start New Chat (Clears Session)"
          className="rounded-md p-1.5 text-muted hover:bg-black/5 hover:text-text transition"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Close Widget */}
        <button
          onClick={onClose}
          type="button"
          title="Close Concierge"
          className="rounded-md p-1.5 text-muted hover:bg-black/5 hover:text-text transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

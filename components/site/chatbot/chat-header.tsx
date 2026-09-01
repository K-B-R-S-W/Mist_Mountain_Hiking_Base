"use client";

import { Plus, X } from "lucide-react";
import { CurrencyCode, LanguageCode } from "@/lib/chatbot/types";
import { MistMountainLogo } from "./mist-mountain-logo";

export function ChatHeader({
  language,
  currency,
  onToggleLanguage,
  onToggleCurrency,
  onResetChat,
  onClose,
}: {
  language: LanguageCode;
  currency: CurrencyCode;
  onToggleLanguage: () => void;
  onToggleCurrency: () => void;
  onResetChat: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-black/8 bg-surface px-4 py-3 shadow-2xs">
      {/* Brand & Status */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-background shadow-xs ring-2 ring-primary/10">
          <MistMountainLogo className="h-5 w-5 text-white" />
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

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Language Toggle */}
        <button
          onClick={onToggleLanguage}
          type="button"
          title="Switch Language (English / Sinhala)"
          className="rounded-lg border border-black/10 bg-background px-2.5 py-1 text-xs font-semibold text-primary shadow-2xs hover:border-primary/30 hover:bg-black/5 active:scale-95 transition-all"
        >
          {language === "en" ? "සිංහල" : "EN"}
        </button>

        {/* Currency Toggle */}
        <button
          onClick={onToggleCurrency}
          type="button"
          title="Switch Currency (LKR / USD)"
          className="rounded-lg border border-black/10 bg-background px-2 py-1 text-xs font-bold text-accent shadow-2xs hover:border-accent/30 hover:bg-black/5 active:scale-95 transition-all"
        >
          {currency}
        </button>

        {/* New Chat Button (+) */}
        <button
          onClick={onResetChat}
          type="button"
          title="Start New Chat (Clears Current Session)"
          className="flex items-center gap-1 rounded-lg border border-black/10 bg-background px-2.5 py-1 text-xs font-medium text-text shadow-2xs hover:border-black/20 hover:bg-black/5 active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5 text-primary stroke-[2.5]" />
          <span className="hidden sm:inline text-[11px]">New</span>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close Concierge"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 bg-background text-muted shadow-2xs hover:border-black/20 hover:bg-black/5 hover:text-text active:scale-95 transition-all"
        >
          <X className="h-4 w-4 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
}

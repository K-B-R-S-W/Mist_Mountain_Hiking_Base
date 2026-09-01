"use client";

import { useReducedMotion } from "motion/react";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { VoiceState } from "@/lib/chatbot/types";

export function ChatVoiceGlobe({
  state,
  transcript,
  onClose,
  onToggleMute,
  isMuted = false,
}: {
  state: VoiceState;
  transcript: string;
  onClose: () => void;
  onToggleMute?: () => void;
  isMuted?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  const getStatusText = () => {
    switch (state) {
      case "listening":
        return "Listening to you...";
      case "processing":
        return "Thinking in the mountain mist...";
      case "speaking":
        return "Mist Mountain Concierge is speaking...";
      case "error":
        return "Audio issue. Try speaking again or type below.";
      default:
        return "Tap to speak with our AI Concierge";
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-between p-6 text-center">
      <div className="flex w-full items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          Voice Agent
        </span>
        <button
          onClick={onClose}
          type="button"
          aria-label="Exit voice mode"
          className="rounded-full p-1.5 text-muted hover:bg-black/5 hover:text-text transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative my-auto flex items-center justify-center">
        {/* Ambient Mist Glow Layers */}
        {!prefersReducedMotion && (
          <>
            <div
              className={`absolute h-48 w-48 rounded-full blur-2xl transition-all duration-700 ${
                state === "speaking"
                  ? "bg-accent/40 scale-125 animate-pulse"
                  : state === "listening"
                  ? "bg-secondary/40 scale-110 animate-pulse"
                  : "bg-primary/20 scale-95"
              }`}
            />
            <div
              className={`absolute h-36 w-36 rounded-full blur-xl transition-all duration-500 ${
                state === "speaking"
                  ? "bg-amber-400/30 scale-110"
                  : state === "listening"
                  ? "bg-emerald-400/30 scale-105"
                  : "bg-primary/30"
              }`}
            />
          </>
        )}

        {/* Central Orb / Globe */}
        <div
          className={`relative flex h-28 w-28 items-center justify-center rounded-full border border-white/40 shadow-2xl transition-transform duration-300 ${
            state === "listening"
              ? "scale-110 bg-gradient-to-tr from-[#163126] via-[#284a3a] to-[#407a5d]"
              : state === "speaking"
              ? "scale-110 bg-gradient-to-tr from-[#163126] via-[#b06a3c] to-[#e69862]"
              : "bg-gradient-to-tr from-[#163126] to-[#284a3a]"
          }`}
        >
          {state === "speaking" ? (
            <Volume2 className="h-10 w-10 text-white animate-bounce" />
          ) : (
            <Mic
              className={`h-10 w-10 text-white ${
                state === "listening" && !prefersReducedMotion ? "animate-pulse" : ""
              }`}
            />
          )}
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <p className="text-sm font-medium text-primary">{getStatusText()}</p>
        {transcript ? (
          <p className="line-clamp-3 rounded-lg bg-surface/80 p-3 text-xs italic text-muted border border-black/5 shadow-sm">
            &ldquo;{transcript}&rdquo;
          </p>
        ) : null}

        <div className="flex items-center justify-center gap-3 pt-2">
          {onToggleMute ? (
            <button
              onClick={onToggleMute}
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-black/10 bg-surface px-4 py-2 text-xs font-medium text-text hover:bg-black/5 transition-colors"
            >
              {isMuted ? <MicOff className="h-3.5 w-3.5 text-red-500" /> : <Mic className="h-3.5 w-3.5" />}
              {isMuted ? "Unmute" : "Mute"}
            </button>
          ) : null}
          <button
            onClick={onClose}
            type="button"
            className="rounded-full bg-primary px-5 py-2 text-xs font-medium text-background hover:bg-secondary transition-colors"
          >
            Switch to Text Chat
          </button>
        </div>
      </div>
    </div>
  );
}

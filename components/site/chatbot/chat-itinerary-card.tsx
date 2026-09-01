"use client";

import { useState } from "react";
import { Calendar, Clock, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { ItineraryCardPayload } from "@/lib/chatbot/types";

export function ChatItineraryCard({
  itinerary,
  onBookStay,
}: {
  itinerary: ItineraryCardPayload;
  onBookStay?: () => void;
}) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const activeDay = itinerary.days?.[activeDayIndex] ?? itinerary.days?.[0];

  if (!activeDay) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-surface shadow-sm">
      <div className="bg-primary/5 p-3 border-b border-black/5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>{itinerary.title}</span>
        </div>
        <p className="mt-1 text-[11px] text-muted">{itinerary.summary}</p>

        {/* Day Selector Pills */}
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
          {itinerary.days.map((day, idx) => (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayIndex(idx)}
              type="button"
              className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition ${
                activeDayIndex === idx
                  ? "bg-primary text-background shadow-xs"
                  : "bg-surface text-text/80 hover:bg-black/5"
              }`}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Active Day Content */}
      <div className="p-3.5 space-y-3">
        <h5 className="font-[family-name:var(--font-fraunces)] text-sm font-semibold text-primary">
          {activeDay.title}
        </h5>

        <div className="space-y-2 text-xs">
          <div className="rounded-lg bg-background p-2.5 border border-black/5">
            <div className="flex items-center justify-between text-primary font-medium">
              <span>🌅 Morning: {activeDay.morning.title}</span>
              <span className="flex items-center gap-0.5 text-[10px] text-muted">
                <Clock className="h-3 w-3" /> {activeDay.morning.duration}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted leading-relaxed">
              {activeDay.morning.desc}
            </p>
          </div>

          <div className="rounded-lg bg-background p-2.5 border border-black/5">
            <div className="flex items-center justify-between text-secondary font-medium">
              <span>☀️ Afternoon: {activeDay.afternoon.title}</span>
              <span className="flex items-center gap-0.5 text-[10px] text-muted">
                <Clock className="h-3 w-3" /> {activeDay.afternoon.duration}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted leading-relaxed">
              {activeDay.afternoon.desc}
            </p>
          </div>

          <div className="rounded-lg bg-background p-2.5 border border-black/5">
            <div className="flex items-center justify-between text-accent font-medium">
              <span>🌙 Evening: {activeDay.evening.title}</span>
              <span className="flex items-center gap-0.5 text-[10px] text-muted">
                <Clock className="h-3 w-3" /> {activeDay.evening.duration}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted leading-relaxed">
              {activeDay.evening.desc}
            </p>
          </div>
        </div>

        {activeDay.highlights && activeDay.highlights.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-1">
            {activeDay.highlights.map((h, i) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary"
              >
                <CheckCircle2 className="h-2.5 w-2.5" />
                {h}
              </span>
            ))}
          </div>
        ) : null}

        {onBookStay ? (
          <button
            onClick={onBookStay}
            type="button"
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-background hover:bg-secondary transition active:scale-98"
          >
            <span>Book This Stay</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

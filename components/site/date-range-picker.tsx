"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Moon, X } from "lucide-react";

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateParts(dateStr: string): [number, number, number] | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return null;
  const [y, m, d] = parts;
  if (y === undefined || m === undefined || d === undefined || isNaN(y) || isNaN(m) || isNaN(d)) {
    return null;
  }
  return [y, m, d];
}

function formatDisplayDate(dateStr: string): string {
  const parts = parseDateParts(dateStr);
  if (!parts) return "";
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calculateNights(startStr: string, endStr: string): number {
  const startParts = parseDateParts(startStr);
  const endParts = parseDateParts(endStr);
  if (!startParts || !endParts) return 0;
  const [y1, m1, d1] = startParts;
  const [y2, m2, d2] = endParts;
  const start = new Date(y1, m1 - 1, d1);
  const end = new Date(y2, m2 - 1, d2);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
}

export function DateRangePicker({ checkIn, checkOut, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectingStep, setSelectingStep] = useState<"checkIn" | "checkOut">("checkIn");
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateString(today);

  const checkInParts = parseDateParts(checkIn);
  const initialViewDate = checkInParts
    ? new Date(checkInParts[0], checkInParts[1] - 1, 1)
    : new Date(today.getFullYear(), today.getMonth(), 1);

  const [viewDate, setViewDate] = useState<Date>(initialViewDate);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const prevMonth = () => {
    if (isCurrentMonth) return;
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const monthName = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(viewYear, viewMonth, day);
    const selectedDateStr = formatDateString(selectedDate);

    if (selectedDateStr < todayStr) return;

    if (selectingStep === "checkIn") {
      if (checkOut && selectedDateStr >= checkOut) {
        onChange(selectedDateStr, "");
        setSelectingStep("checkOut");
      } else {
        onChange(selectedDateStr, checkOut);
        setSelectingStep("checkOut");
      }
    } else {
      if (selectedDateStr <= checkIn) {
        onChange(selectedDateStr, "");
        setSelectingStep("checkOut");
      } else {
        onChange(checkIn, selectedDateStr);
        setIsOpen(false);
        setSelectingStep("checkIn");
      }
    }
  };

  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", "");
    setSelectingStep("checkIn");
  };

  const nights = calculateNights(checkIn, checkOut);

  return (
    <div className="relative w-full" ref={containerRef}>
      <input type="hidden" name="checkIn" value={checkIn} />
      <input type="hidden" name="checkOut" value={checkOut} />

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setSelectingStep("checkIn");
            setIsOpen(true);
          }}
          className={`flex items-center justify-between gap-3 rounded-md border p-3 text-left transition ${
            isOpen && selectingStep === "checkIn"
              ? "border-accent bg-accent/5 ring-1 ring-accent"
              : "border-black/10 bg-white hover:border-black/25"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="h-4 w-4 text-accent" />
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted">
                Check-in
              </span>
              <span className="text-sm font-medium text-text">
                {checkIn ? formatDisplayDate(checkIn) : "Select date"}
              </span>
            </div>
          </div>
          {checkIn && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Set
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectingStep("checkOut");
            setIsOpen(true);
          }}
          className={`flex items-center justify-between gap-3 rounded-md border p-3 text-left transition ${
            isOpen && selectingStep === "checkOut"
              ? "border-accent bg-accent/5 ring-1 ring-accent"
              : "border-black/10 bg-white hover:border-black/25"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="h-4 w-4 text-accent" />
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted">
                Check-out
              </span>
              <span className="text-sm font-medium text-text">
                {checkOut ? formatDisplayDate(checkOut) : "Select date"}
              </span>
            </div>
          </div>
          {checkOut && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Set
            </span>
          )}
        </button>
      </div>

      {nights > 0 && (
        <div className="mt-2.5 flex items-center justify-between rounded-md border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs text-primary">
          <div className="flex items-center gap-1.5 font-medium">
            <Moon className="h-3.5 w-3.5 text-accent" />
            <span>
              {nights} {nights === 1 ? "night" : "nights"} stay
            </span>
          </div>
          <button
            type="button"
            onClick={clearDates}
            className="flex items-center gap-1 text-[11px] text-muted hover:text-red-700"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        </div>
      )}

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-black/10 bg-white p-4 shadow-xl sm:w-[340px]">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              disabled={isCurrentMonth}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text transition hover:bg-black/5 disabled:opacity-20 disabled:hover:bg-transparent"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-[family-name:var(--font-fraunces)] text-sm font-medium text-text">
              {monthName}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text transition hover:bg-black/5"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 text-center text-xs font-medium text-accent">
            {selectingStep === "checkIn"
              ? "Select your arrival date"
              : "Select your departure date"}
          </div>

          <div className="mb-1.5 grid grid-cols-7 text-center text-[11px] font-semibold text-muted">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dateObj = new Date(viewYear, viewMonth, day);
              const dateStr = formatDateString(dateObj);
              const isPast = dateStr < todayStr;
              const isCheckIn = dateStr === checkIn;
              const isCheckOut = dateStr === checkOut;
              const isStartOrEnd = isCheckIn || isCheckOut;

              const inSelectedRange =
                checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

              const inHoverRange =
                selectingStep === "checkOut" &&
                checkIn &&
                !checkOut &&
                hoverDate &&
                dateStr > checkIn &&
                dateStr <= hoverDate;

              let btnStyle = "text-text hover:bg-black/5";
              if (isPast) {
                btnStyle = "text-black/20 cursor-not-allowed";
              } else if (isStartOrEnd) {
                btnStyle = "bg-primary text-background font-semibold shadow-sm";
              } else if (inSelectedRange) {
                btnStyle = "bg-primary/10 text-primary font-medium rounded-none";
              } else if (inHoverRange) {
                btnStyle = "bg-accent/15 text-accent rounded-none";
              }

              return (
                <div
                  key={day}
                  className={`relative flex h-8 items-center justify-center p-0.5 ${
                    inSelectedRange || inHoverRange ? "bg-primary/5" : ""
                  }`}
                  onMouseEnter={() => !isPast && setHoverDate(dateStr)}
                  onMouseLeave={() => setHoverDate(null)}
                >
                  <button
                    type="button"
                    disabled={isPast}
                    onClick={() => handleDateClick(day)}
                    className={`h-7 w-7 rounded-full text-xs transition ${btnStyle}`}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
            <button
              type="button"
              onClick={clearDates}
              className="text-xs text-muted hover:text-text"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-background"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Calendar } from "lucide-react";

export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFrom = searchParams.get("from") ?? "";
  const currentTo = searchParams.get("to") ?? "";

  const setRange = useCallback(
    (from: string, to: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", from);
      params.set("to", to);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const setThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setRange(firstDay.toISOString().slice(0, 10), lastDay.toISOString().slice(0, 10));
  };

  const setLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    setRange(firstDay.toISOString().slice(0, 10), lastDay.toISOString().slice(0, 10));
  };

  const setThisYear = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);
    setRange(firstDay.toISOString().slice(0, 10), lastDay.toISOString().slice(0, 10));
  };

  return (
    <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted mr-1 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-accent" />
          Presets:
        </span>
        <button
          type="button"
          onClick={setThisMonth}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          This Month
        </button>
        <button
          type="button"
          onClick={setLastMonth}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          Last Month
        </button>
        <button
          type="button"
          onClick={setThisYear}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          This Year
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted">
          <span>From:</span>
          <input
            type="date"
            className="form-input py-1 text-xs"
            value={currentFrom}
            onChange={(e) => setRange(e.target.value, currentTo)}
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-muted">
          <span>To:</span>
          <input
            type="date"
            className="form-input py-1 text-xs"
            value={currentTo}
            onChange={(e) => setRange(currentFrom, e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

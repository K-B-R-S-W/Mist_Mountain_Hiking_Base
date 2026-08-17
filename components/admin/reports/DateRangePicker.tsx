"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

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
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={setThisMonth} className="btn-secondary">This Month</button>
        <button type="button" onClick={setLastMonth} className="btn-secondary">Last Month</button>
        <button type="button" onClick={setThisYear} className="btn-secondary">This Year</button>
      </div>
      <div className="flex items-center gap-2">
        <label className="form-field">
          From
          <input
            type="date"
            className="form-input"
            value={currentFrom}
            onChange={(e) => setRange(e.target.value, currentTo)}
          />
        </label>
        <label className="form-field">
          To
          <input
            type="date"
            className="form-input"
            value={currentTo}
            onChange={(e) => setRange(currentFrom, e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

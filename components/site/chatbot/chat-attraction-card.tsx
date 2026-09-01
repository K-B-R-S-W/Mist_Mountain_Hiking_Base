"use client";

import Link from "next/link";
import { Compass, ExternalLink } from "lucide-react";
import { AttractionCardPayload } from "@/lib/chatbot/types";

export function ChatAttractionCard({
  attraction,
  onNavigate,
}: {
  attraction: AttractionCardPayload;
  onNavigate?: (href: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-surface p-3.5 shadow-sm transition hover:border-black/20">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
          {attraction.eyebrow}
        </span>
        {attraction.badge ? (
          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {attraction.badge}
          </span>
        ) : null}
      </div>

      <h4 className="mt-1 font-[family-name:var(--font-fraunces)] text-base font-semibold text-primary">
        {attraction.title}
      </h4>

      <p className="mt-1 text-xs text-muted leading-relaxed">
        {attraction.description}
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2">
        <div className="flex items-center gap-1 text-[11px] text-muted">
          <Compass className="h-3.5 w-3.5 text-secondary" />
          <span>Mist Mountain Circuit</span>
        </div>

        {onNavigate ? (
          <button
            onClick={() => onNavigate(attraction.href)}
            type="button"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-accent transition"
          >
            Explore Area
            <ExternalLink className="h-3 w-3" />
          </button>
        ) : (
          <Link
            href={attraction.href}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-accent transition"
          >
            Explore Area
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { Users, Bed, ArrowRight } from "lucide-react";
import { CurrencyCode, RoomCardPayload } from "@/lib/chatbot/types";

export function ChatRoomCard({
  room,
  currency = "LKR",
  onSelect,
}: {
  room: RoomCardPayload;
  currency?: CurrencyCode;
  onSelect?: (room: RoomCardPayload) => void;
}) {
  const displayPrice =
    currency === "USD"
      ? `$${room.basePriceUsd} USD`
      : `LKR ${room.basePriceLkr.toLocaleString()}`;

  const secondaryPrice =
    currency === "USD"
      ? `(approx. LKR ${room.basePriceLkr.toLocaleString()})`
      : `(~$${room.basePriceUsd} USD)`;

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-surface shadow-sm transition-all hover:border-black/20 hover:shadow-md">
      {room.imageUrl ? (
        <div className="relative h-32 w-full bg-black/5">
          <Image
            src={room.imageUrl}
            alt={room.name}
            fill
            sizes="(max-width: 400px) 100vw, 360px"
            className="object-cover"
          />
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
            Up to {room.maxGuests} {room.maxGuests === 1 ? "Guest" : "Guests"}
          </span>
        </div>
      ) : null}

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-[family-name:var(--font-fraunces)] text-base font-semibold text-primary">
            {room.name}
          </h4>
        </div>

        {room.shortDescription ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted">
            {room.shortDescription}
          </p>
        ) : null}

        <div className="mt-3 flex items-baseline justify-between border-t border-black/5 pt-2.5">
          <div>
            <span className="text-sm font-bold text-accent">{displayPrice}</span>
            <span className="text-[11px] text-muted"> / night</span>
            <p className="text-[10px] text-muted/80">{secondaryPrice}</p>
          </div>

          {onSelect ? (
            <button
              onClick={() => onSelect(room)}
              type="button"
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-background transition hover:bg-secondary active:scale-95"
            >
              Book Room
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <a
              href={`/rooms/${room.slug}`}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Details
              <ArrowRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

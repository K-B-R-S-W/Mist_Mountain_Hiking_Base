"use client";

import { useState } from "react";
import { Calendar, Users, Check, AlertCircle, Loader2, Sparkles, Phone, Mail, User } from "lucide-react";
import { submitChatbotBooking } from "@/lib/actions/submit-chatbot-booking";
import { submitChatLead } from "@/lib/actions/submit-chat-lead";
import { BookingDraftPayload, BookingVoucherPayload, CurrencyCode } from "@/lib/chatbot/types";

export function ChatBookingFlow({
  initialDraft,
  currency = "LKR",
  sessionId,
  onBookingSuccess,
  onCancel,
}: {
  initialDraft?: BookingDraftPayload;
  currency?: CurrencyCode;
  sessionId: string;
  onBookingSuccess?: (voucher: BookingVoucherPayload) => void;
  onCancel?: () => void;
}) {
  const availableRooms = initialDraft?.availableRooms && initialDraft.availableRooms.length > 0
    ? initialDraft.availableRooms
    : [
        {
          id: initialDraft?.roomId || "ba3cf45f-41e9-4a45-92ec-d37340d3b60f",
          name: initialDraft?.roomName || "Double Room with Private Bathroom",
          basePriceLkr: initialDraft?.pricePerNightLkr || 7500,
          basePriceUsd: initialDraft?.pricePerNightUsd || 24,
          maxGuests: 2,
        },
        {
          id: "deluxe-triple-room",
          name: "Deluxe Triple Room",
          basePriceLkr: 11000,
          basePriceUsd: 35,
          maxGuests: 3,
        },
        {
          id: "mountain-family-suite",
          name: "Mountain Family Suite",
          basePriceLkr: 16000,
          basePriceUsd: 52,
          maxGuests: 5,
        },
      ];

  const [step, setStep] = useState<"edit" | "review" | "confirmed">("edit");
  const [roomId, setRoomId] = useState(initialDraft?.roomId || availableRooms[0]?.id || "");
  const [roomName, setRoomName] = useState(initialDraft?.roomName || availableRooms[0]?.name || "");
  const [pricePerNightLkr, setPricePerNightLkr] = useState(initialDraft?.pricePerNightLkr || availableRooms[0]?.basePriceLkr || 7500);
  const [checkIn, setCheckIn] = useState(initialDraft?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initialDraft?.checkOut ?? "");
  const [guests, setGuests] = useState(initialDraft?.guests ?? 2);
  const [guestName, setGuestName] = useState(initialDraft?.guestName ?? "");
  const [email, setEmail] = useState(initialDraft?.email ?? "");
  const [phone, setPhone] = useState(initialDraft?.phone ?? "");
  const [message, setMessage] = useState(initialDraft?.message ?? "");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voucher, setVoucher] = useState<BookingVoucherPayload | null>(null);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const basePrice = pricePerNightLkr;
  const totalLkr = basePrice * nights;
  const totalUsd = Math.round(totalLkr / 310);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!guestName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      setErrorMessage("Check-out date must be after check-in date.");
      return;
    }

    submitChatLead({
      sessionId,
      guestName,
      email,
      phone,
      roomId,
      checkIn,
      checkOut,
      guests,
      type: "abandoned_booking",
      notes: "Lead captured at chat review step",
    }).catch(() => {});

    setStep("review");
  };

  const handleFinalConfirm = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await submitChatbotBooking({
        guestName,
        email,
        phone,
        roomId,
        checkIn,
        checkOut,
        guests,
        message,
      });

      if (result.status === "success") {
        const newVoucher: BookingVoucherPayload = {
          bookingId: result.bookingId,
          guestName: result.guestName,
          roomName: result.roomName,
          checkIn: result.checkIn,
          checkOut: result.checkOut,
          guests: result.guests,
          status: "Pending Confirmation",
          createdAt: new Date().toLocaleDateString(),
        };

        setVoucher(newVoucher);
        setStep("confirmed");
        if (onBookingSuccess) onBookingSuccess(newVoucher);
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage("Could not complete booking. Please try again or message via WhatsApp.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "confirmed" && voucher) {
    return (
      <div className="overflow-hidden rounded-xl border border-secondary/30 bg-surface p-4 shadow-md">
        <div className="flex items-center gap-2 text-secondary">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-primary">
              Reservation Inquiry Received!
            </h4>
            <p className="text-[11px] text-muted">Reference: #{voucher.bookingId.slice(0, 8)}</p>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-background p-3 text-xs space-y-1.5 border border-black/5">
          <div className="flex justify-between">
            <span className="text-muted">Guest:</span>
            <span className="font-medium text-text">{voucher.guestName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Room:</span>
            <span className="font-medium text-text">{voucher.roomName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Dates:</span>
            <span className="font-medium text-text">
              {voucher.checkIn} to {voucher.checkOut}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Guests:</span>
            <span className="font-medium text-text">{voucher.guests} Guests</span>
          </div>
          <div className="flex justify-between border-t border-black/5 pt-1">
            <span className="text-muted">Status:</span>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
              Pending Confirmation
            </span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted text-center">
          We&apos;ve sent a confirmation email to <span className="font-medium text-text">{email}</span>. Our host team will contact you shortly!
        </p>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="overflow-hidden rounded-xl border border-accent/30 bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-1.5 text-accent font-semibold text-xs">
          <Sparkles className="h-4 w-4" />
          <span>Review & Confirm Reservation</span>
        </div>

        <div className="mt-3 rounded-lg bg-background p-3 text-xs space-y-2 border border-black/5">
          <div className="flex justify-between">
            <span className="text-muted">Room:</span>
            <span className="font-semibold text-primary">{roomName || "Mountain Stay"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Dates:</span>
            <span className="font-medium text-text">
              {checkIn || "Flexible"} → {checkOut || "Flexible"} ({nights} {nights === 1 ? "Night" : "Nights"})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Guests:</span>
            <span className="font-medium text-text">{guests}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Guest:</span>
            <span className="font-medium text-text">{guestName} ({phone || email})</span>
          </div>
          <div className="flex justify-between border-t border-black/5 pt-1.5 text-xs font-bold text-accent">
            <span>Estimated Total:</span>
            <span>{currency === "USD" ? `$${totalUsd} USD` : `LKR ${totalLkr.toLocaleString()}`}</span>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-2 flex items-center gap-1.5 rounded-md bg-red-50 p-2 text-xs text-red-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setStep("edit")}
            type="button"
            className="w-1/3 rounded-lg border border-black/10 py-2 text-xs font-medium text-text hover:bg-black/5 transition"
          >
            Edit
          </button>
          <button
            onClick={handleFinalConfirm}
            disabled={isLoading}
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-xs font-bold text-white hover:bg-accent/90 transition shadow-xs disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Confirm & Reserve
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleProceedToReview} className="overflow-hidden rounded-xl border border-black/10 bg-surface p-3.5 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between border-b border-black/5 pb-2">
        <h4 className="font-[family-name:var(--font-fraunces)] text-sm font-semibold text-primary">
          Check Availability & Book
        </h4>
        {onCancel ? (
          <button onClick={onCancel} type="button" className="text-xs text-muted hover:text-text">
            Cancel
          </button>
        ) : null}
      </div>

      {/* Room Selector Dropdown */}
      <div>
        <label className="text-[10px] font-medium text-muted block mb-0.5">Select Room</label>
        <select
          value={roomId}
          onChange={(e) => {
            const selectedId = e.target.value;
            setRoomId(selectedId);
            const chosen = availableRooms.find((r) => r.id === selectedId);
            if (chosen) {
              setRoomName(chosen.name);
              setPricePerNightLkr(chosen.basePriceLkr);
            }
          }}
          className="w-full rounded-md border border-black/15 bg-background px-2.5 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden font-medium"
        >
          {availableRooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {currency === "USD" ? `$${r.basePriceUsd}/night` : `LKR ${r.basePriceLkr.toLocaleString()}/night`}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-muted block mb-0.5">Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-background px-2 py-1.5 text-xs focus:border-primary focus:outline-hidden"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted block mb-0.5">Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-background px-2 py-1.5 text-xs focus:border-primary focus:outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-muted block mb-0.5">Guests</label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-md border border-black/15 bg-background px-2 py-1.5 text-xs focus:border-primary focus:outline-hidden"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted block mb-0.5">Your Name *</label>
          <input
            type="text"
            required
            placeholder="Full name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-background px-2 py-1.5 text-xs focus:border-primary focus:outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-muted block mb-0.5">Email *</label>
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-background px-2 py-1.5 text-xs focus:border-primary focus:outline-hidden"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted block mb-0.5">Phone / WhatsApp</label>
          <input
            type="tel"
            placeholder="+94 7..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-background px-2 py-1.5 text-xs focus:border-primary focus:outline-hidden"
          />
        </div>
      </div>

      {errorMessage ? (
        <div className="flex items-center gap-1.5 rounded-md bg-red-50 p-2 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-background hover:bg-secondary transition active:scale-98"
      >
        Review Reservation Details →
      </button>
    </form>
  );
}

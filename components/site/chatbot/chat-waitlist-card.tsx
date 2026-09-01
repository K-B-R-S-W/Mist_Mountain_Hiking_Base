"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { submitChatWaitlist } from "@/lib/actions/submit-chat-lead";
import { WaitlistPayload } from "@/lib/chatbot/types";

export function ChatWaitlistCard({
  data,
  onSuccess,
}: {
  data?: WaitlistPayload;
  onSuccess?: () => void;
}) {
  const [guestName, setGuestName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !contactInfo.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await submitChatWaitlist({
      guestName,
      contactInfo,
      roomId: data?.roomId,
      checkIn: data?.checkIn,
      checkOut: data?.checkOut,
      notes: "Waitlist joined via Chatbot",
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsDone(true);
      if (onSuccess) onSuccess();
    } else {
      setError(res.message ?? "Could not save. Please try again.");
    }
  };

  if (isDone) {
    return (
      <div className="rounded-xl border border-secondary/30 bg-surface p-3.5 text-xs text-center shadow-xs">
        <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-secondary/10 text-secondary mb-2">
          <Check className="h-4 w-4" />
        </div>
        <p className="font-semibold text-primary">Added to Priority Waitlist!</p>
        <p className="mt-1 text-[11px] text-muted">
          We&apos;ll reach out immediately via WhatsApp or Email if these dates open up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-black/10 bg-surface p-3.5 shadow-xs space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
        <Bell className="h-4 w-4 text-accent" />
        <span>Sold Out Dates? Get Notified</span>
      </div>
      <p className="text-[11px] text-muted leading-relaxed">
        Leave your name and WhatsApp/Email. If a reservation is cancelled or extra rooms open, you&apos;ll be notified first.
      </p>

      <div className="space-y-1.5">
        <input
          type="text"
          required
          placeholder="Your Name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full rounded-md border border-black/15 bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-hidden"
        />
        <input
          type="text"
          required
          placeholder="WhatsApp Number or Email"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          className="w-full rounded-md border border-black/15 bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-hidden"
        />
      </div>

      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-secondary py-1.5 text-xs font-medium text-background hover:bg-primary transition disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
        Join Priority Waitlist
      </button>
    </form>
  );
}

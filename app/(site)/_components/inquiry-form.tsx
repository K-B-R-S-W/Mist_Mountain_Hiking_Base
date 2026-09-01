"use client";

import { useActionState, useState } from "react";
import { submitInquiry, type SubmitInquiryState } from "@/lib/actions/submit-inquiry";
import type { RoomDetail, RoomSummary } from "@/lib/types/domain";
import { DateRangePicker } from "@/components/site/date-range-picker";
import { CheckCircle2 } from "lucide-react";

const INITIAL_STATE: SubmitInquiryState = { status: "idle" };

export function InquiryForm({
  rooms = [],
  defaultRoomId,
  selectedRoom: propSelectedRoom,
}: {
  rooms?: RoomSummary[];
  defaultRoomId?: string;
  selectedRoom?: RoomSummary | RoomDetail | null;
}) {
  const [state, formAction, pending] = useActionState(submitInquiry, INITIAL_STATE);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const selectedRoom =
    propSelectedRoom ??
    (defaultRoomId ? rooms.find((r) => r.id === defaultRoomId) : null);

  const handleDateChange = (newCheckIn: string, newCheckOut: string) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  return (
    <form action={formAction} className="card space-y-5">
      {selectedRoom ? (
        <div className="rounded-lg border border-primary/15 bg-primary/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="eyebrow text-accent">Selected Room</span>
              <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-medium text-primary">
                {selectedRoom.name}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="badge bg-white">Up to {selectedRoom.maxGuests} guests</span>
              <span className="badge bg-white">
                From LKR {selectedRoom.basePrice.toLocaleString()} / night
              </span>
            </div>
          </div>
          <input type="hidden" name="roomId" value={selectedRoom.id} />
        </div>
      ) : (
        <label className="form-field">
          <span>Choose a room (optional)</span>
          <select
            name="roomId"
            defaultValue={defaultRoomId ?? ""}
            className="form-input"
          >
            <option value="">Any suitable room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} — from LKR {room.basePrice.toLocaleString()} (up to{" "}
                {room.maxGuests} guests)
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted">Stay Dates</span>
        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={handleDateChange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="form-field">
          <span>Your name</span>
          <input
            name="guestName"
            required
            placeholder="e.g. Maya Fernando"
            className="form-input"
          />
        </label>
        <label className="form-field">
          <span>Email address</span>
          <input
            name="email"
            type="email"
            required
            placeholder="e.g. maya@example.com"
            className="form-input"
          />
        </label>
        <label className="form-field">
          <span>Phone number (optional)</span>
          <input
            name="phone"
            type="tel"
            placeholder="+94 77 123 4567"
            className="form-input"
          />
        </label>
        <label className="form-field">
          <span>Number of guests</span>
          <input
            name="guests"
            type="number"
            min={1}
            max={selectedRoom ? selectedRoom.maxGuests : 50}
            defaultValue={2}
            className="form-input"
          />
        </label>
      </div>

      <label className="form-field">
        <span>Message & special requests (optional)</span>
        <textarea
          name="message"
          rows={4}
          placeholder="Tell us about your arrival time, dietary preferences, hiking interests, or any questions..."
          className="form-input resize-y"
        />
      </label>

      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {state.status === "success" ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-secondary/20 bg-secondary/10 p-3.5 text-sm text-secondary">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            Thank you! Your inquiry has been sent. We will review availability and contact you shortly.
          </span>
        </div>
      ) : null}
      {state.status === "error" ? (
        <p role="alert" className="text-sm text-red-700">
          {state.message ?? "Something went wrong."}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
        {pending ? "Sending inquiry..." : "Send availability inquiry"}
      </button>
    </form>
  );
}



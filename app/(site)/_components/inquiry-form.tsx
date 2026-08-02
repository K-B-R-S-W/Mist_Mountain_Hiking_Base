"use client";

import { useActionState } from "react";
import { submitInquiry, type SubmitInquiryState } from "@/lib/actions/submit-inquiry";
import type { RoomSummary } from "@/lib/types/domain";

const INITIAL_STATE: SubmitInquiryState = { status: "idle" };

export function InquiryForm({
  rooms,
  defaultRoomId,
}: {
  rooms: RoomSummary[];
  defaultRoomId?: string;
}) {
  const [state, formAction, pending] = useActionState(submitInquiry, INITIAL_STATE);

  return (
    <form action={formAction} className="card space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="form-field">
          <span>Name</span>
          <input name="guestName" required className="form-input" />
        </label>
        <label className="form-field">
          <span>Email</span>
          <input name="email" type="email" required className="form-input" />
        </label>
        <label className="form-field">
          <span>Phone</span>
          <input name="phone" className="form-input" />
        </label>
        <label className="form-field">
          <span>Guests</span>
          <input name="guests" type="number" min={1} max={50} className="form-input" />
        </label>
        <label className="form-field">
          <span>Check-in</span>
          <input name="checkIn" type="date" className="form-input" />
        </label>
        <label className="form-field">
          <span>Check-out</span>
          <input name="checkOut" type="date" className="form-input" />
        </label>
      </div>

      <label className="form-field">
        <span>Room (optional)</span>
        <select name="roomId" defaultValue={defaultRoomId ?? ""} className="form-input">
          <option value="">Any suitable room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Message</span>
        <textarea name="message" rows={5} className="form-input resize-y" />
      </label>

      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {state.status === "success" ? (
        <p className="text-sm text-secondary">Thanks, we&apos;ll contact you shortly.</p>
      ) : null}
      {state.status === "error" ? (
        <p role="alert" className="text-sm text-red-700">
          {state.message ?? "Something went wrong."}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Sending..." : "Send inquiry"}
      </button>
    </form>
  );
}


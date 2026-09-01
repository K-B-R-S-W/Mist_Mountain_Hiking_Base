"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit/simple-rate-limit";
import { sendInquiryNotification } from "@/lib/email/send-inquiry-notification";
import { checkRoomAvailability } from "@/lib/chatbot/availability";

export type SubmitChatbotBookingInput = {
  guestName: string;
  email: string;
  phone?: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  message?: string;
};

export type SubmitChatbotBookingResult =
  | {
      status: "success";
      bookingId: string;
      guestName: string;
      roomName: string;
      checkIn: string;
      checkOut: string;
      guests: number;
    }
  | {
      status: "error";
      message: string;
      isUnavailable?: boolean;
    };

export async function submitChatbotBooking(
  input: SubmitChatbotBookingInput
): Promise<SubmitChatbotBookingResult> {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`chat_booking:${ip}`)) {
    return {
      status: "error",
      message: "Too many requests. Please wait a few minutes before trying again.",
    };
  }

  if (!input.guestName || input.guestName.trim().length === 0) {
    return { status: "error", message: "Please provide your name." };
  }
  if (!input.email || !input.email.includes("@")) {
    return { status: "error", message: "Please provide a valid email address." };
  }

  const supabase = await createClient();

  if (input.roomId && input.checkIn && input.checkOut) {
    const avail = await checkRoomAvailability({
      roomId: input.roomId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
    });

    if (!avail.isAvailable) {
      return {
        status: "error",
        message: avail.conflictReason ?? "Selected room is not available for these dates.",
        isUnavailable: true,
      };
    }
  }

  let roomName = "Mountain Base";
  if (input.roomId) {
    const { data: roomData } = await supabase
      .from("rooms")
      .select("name")
      .eq("id", input.roomId)
      .maybeSingle();
    if (roomData?.name) {
      roomName = roomData.name;
    }
  }

  const { data: bookingRow, error: insertError } = await supabase
    .from("bookings")
    .insert({
      room_id: input.roomId || null,
      guest_name: input.guestName.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      check_in: input.checkIn || null,
      check_out: input.checkOut || null,
      guests: input.guests ?? 2,
      message: input.message?.trim() || "Inquiry placed via AI Concierge Chatbot",
      status: "pending",
      source: "chatbot",
    })
    .select("id, guest_name, check_in, check_out, guests")
    .single();

  if (insertError || !bookingRow) {
    console.error("Chatbot booking insertion error:", insertError);
    if (
      insertError?.code === "23P01" ||
      insertError?.message?.includes("overlapping") ||
      insertError?.message?.includes("exclude") ||
      insertError?.message?.includes("conflict")
    ) {
      return {
        status: "error",
        message: "This room was just booked by another guest for the selected dates. Please choose different dates or another room.",
        isUnavailable: true,
      };
    }
    return {
      status: "error",
      message: "Could not save your reservation. Please try again or reach out via WhatsApp.",
    };
  }

  try {
    await supabase.from("activity_logs").insert({
      action: "create",
      entity: "booking",
      entity_id: bookingRow.id,
    });
  } catch (e) {
    console.warn("Activity log insert failed:", e);
  }

  await sendInquiryNotification({
    guestName: bookingRow.guest_name,
    email: input.email.trim(),
    phone: input.phone?.trim(),
    checkIn: bookingRow.check_in,
    checkOut: bookingRow.check_out,
    guests: bookingRow.guests,
    message: input.message?.trim() ? `[Via Chatbot] ${input.message.trim()}` : "[Via Chatbot]",
    roomName,
  }).catch((e) => console.error("Chatbot inquiry email failed:", e));

  return {
    status: "success",
    bookingId: bookingRow.id,
    guestName: bookingRow.guest_name,
    roomName,
    checkIn: bookingRow.check_in ?? input.checkIn ?? "TBD",
    checkOut: bookingRow.check_out ?? input.checkOut ?? "TBD",
    guests: bookingRow.guests ?? input.guests ?? 2,
  };
}

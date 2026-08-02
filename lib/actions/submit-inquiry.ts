"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { inquirySchema } from "@/lib/validation/inquiry";
import { isRateLimited } from "@/lib/rate-limit/simple-rate-limit";
import { sendInquiryNotification } from "@/lib/email/send-inquiry-notification";

export type SubmitInquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
};

/**
 * Public Server Action — no requireAdmin() here on purpose, anyone can call
 * this. Every other layer of defense still applies:
 *   1. honeypot field (bots fill it, humans never see it — see validation)
 *   2. IP-based rate limit
 *   3. zod validation of every field
 *   4. the `bookings` table's own RLS `with check` constraint on insert
 * No CAPTCHA for launch, per project decision — revisit only if spam
 * actually shows up in /admin/bookings.
 */
export async function submitInquiry(
  _prevState: SubmitInquiryState,
  formData: FormData
): Promise<SubmitInquiryState> {
  const parsed = inquirySchema.safeParse({
    guestName: formData.get("guestName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    guests: formData.get("guests"),
    message: formData.get("message"),
    roomId: formData.get("roomId"),
    website: formData.get("website"), // honeypot
  });

  if (!parsed.success) {
    return { status: "error", message: "Please check the form and try again." };
  }

  if (parsed.data.website) {
    // Honeypot tripped. Return a fake success so the bot doesn't learn
    // anything — don't hit the DB or send an email.
    return { status: "success" };
  }

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`inquiry:${ip}`)) {
    return {
      status: "error",
      message: "Too many requests — please try again in a few minutes.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("bookings").insert({
    room_id: parsed.data.roomId || null,
    guest_name: parsed.data.guestName,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    check_in: parsed.data.checkIn || null,
    check_out: parsed.data.checkOut || null,
    guests: parsed.data.guests ?? null,
    message: parsed.data.message || null,
  });

  if (error) {
    console.error("submitInquiry insert failed:", error.message);
    return { status: "error", message: "Something went wrong — please try again." };
  }

  await sendInquiryNotification({
    guestName: parsed.data.guestName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    checkIn: parsed.data.checkIn,
    checkOut: parsed.data.checkOut,
    guests: parsed.data.guests,
    message: parsed.data.message,
  }).catch((e) => console.error("Inquiry email failed:", e));

  return { status: "success" };
}

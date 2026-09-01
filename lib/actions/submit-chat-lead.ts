"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitChatLead(options: {
  sessionId?: string;
  guestName?: string;
  email?: string;
  phone?: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  type?: "abandoned_booking" | "group_inquiry" | "general_lead";
  notes?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    await supabase.from("chat_leads").insert({
      session_id: options.sessionId || null,
      guest_name: options.guestName || null,
      email: options.email || null,
      phone: options.phone || null,
      room_id: options.roomId || null,
      check_in: options.checkIn || null,
      check_out: options.checkOut || null,
      guests: options.guests || null,
      type: options.type || "abandoned_booking",
      notes: options.notes || null,
      metadata: options.metadata || {},
      status: "new",
    });
    return { success: true };
  } catch (err) {
    console.error("submitChatLead error:", err);
    return { success: false };
  }
}

export async function submitChatWaitlist(options: {
  guestName: string;
  contactInfo: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  notes?: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    if (!options.guestName || !options.contactInfo) {
      return { success: false, message: "Please provide your name and contact information." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("chat_waitlists").insert({
      guest_name: options.guestName.trim(),
      contact_info: options.contactInfo.trim(),
      room_id: options.roomId || null,
      check_in: options.checkIn || null,
      check_out: options.checkOut || null,
      guests: options.guests || 2,
      notes: options.notes || null,
      status: "pending",
    });

    if (error) {
      console.error("submitChatWaitlist insert failed:", error);
      return { success: false, message: "Could not save waitlist request. Please try again." };
    }

    return { success: true };
  } catch (err) {
    console.error("submitChatWaitlist error:", err);
    return { success: false, message: "Something went wrong." };
  }
}

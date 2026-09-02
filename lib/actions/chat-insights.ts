"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";
import { getSiteSettings } from "@/lib/repositories/site";

const toggleUnansweredSchema = z.object({
  id: z.string().uuid(),
  isResolved: z.boolean(),
});

export async function toggleUnansweredLog(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = toggleUnansweredSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid log update parameters.");
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("chat_unanswered_logs")
      .update({ is_resolved: parsed.data.isResolved })
      .eq("id", parsed.data.id);

    if (error) {
      throw new Error("Failed to update query status: " + error.message);
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity: "chat_unanswered_log",
      entity_id: parsed.data.id,
    });

    revalidatePath("/admin/insights");
    return { id: parsed.data.id };
  });
}

const updateLeadStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "converted", "archived"]),
});

export async function updateChatLeadStatus(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = updateLeadStatusSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid lead status update.");
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("chat_leads")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id);

    if (error) {
      throw new Error("Failed to update lead status: " + error.message);
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity: "chat_lead",
      entity_id: parsed.data.id,
    });

    revalidatePath("/admin/insights");
    return { id: parsed.data.id };
  });
}

const updateWaitlistStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "notified", "expired", "archived"]),
});

export async function updateChatWaitlistStatus(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = updateWaitlistStatusSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid waitlist status update.");
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("chat_waitlists")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id);

    if (error) {
      throw new Error("Failed to update waitlist status: " + error.message);
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity: "chat_waitlist",
      entity_id: parsed.data.id,
    });

    revalidatePath("/admin/insights");
    return { id: parsed.data.id };
  });
}

const notifyWaitlistSchema = z.object({
  id: z.string().uuid(),
  guestName: z.string(),
  contactInfo: z.string(),
  roomName: z.string().optional().nullable(),
  checkIn: z.string().optional().nullable(),
  checkOut: z.string().optional().nullable(),
});

export async function notifyWaitlistGuest(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = notifyWaitlistSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid waitlist notification request.");
    }

    const { id, guestName, contactInfo, roomName, checkIn, checkOut } = parsed.data;

    // Send email if contact info contains an email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(contactInfo)) {
      const owner = process.env.GMAIL_USER;
      const pass = process.env.GMAIL_APP_PASSWORD;

      if (owner && pass) {
        let hotelName = "Mist Mountain Hiking Base";
        try {
          const settings = await getSiteSettings();
          hotelName = settings.hotelName;
        } catch {
          // fallback
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: owner, pass },
        });

        const stayInfo = checkIn && checkOut ? `for dates ${checkIn} to ${checkOut}` : "";
        const roomInfo = roomName ? `for ${roomName}` : "";

        await transporter.sendMail({
          from: `"${hotelName}" <${owner}>`,
          to: contactInfo,
          subject: `Room Availability Update — ${hotelName}`,
          text: `Dear ${guestName},\n\nGood news! A room has opened up at ${hotelName} ${roomInfo} ${stayInfo}.\n\nPlease contact us directly or visit our website to secure your reservation.\n\nWarm regards,\n${hotelName} Team`,
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: auto; padding: 24px; color: #1d1d1d;">
              <h2 style="color: #163126; margin-top: 0;">Room Availability Update</h2>
              <p>Dear ${guestName},</p>
              <p>Good news! Accommodation has opened up at <strong>${hotelName}</strong> ${roomInfo} ${stayInfo}.</p>
              <p>Please contact us directly or book online to secure your stay before dates fill up.</p>
              <p style="margin-top: 24px; color: #6b6b6b; font-size: 13px;">Warm regards,<br>The ${hotelName} Team</p>
            </div>
          `,
        });
      }
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("chat_waitlists")
      .update({ status: "notified" })
      .eq("id", id);

    if (error) {
      throw new Error("Failed to update status: " + error.message);
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "notify",
      entity: "chat_waitlist",
      entity_id: id,
    });

    revalidatePath("/admin/insights");
    return { id };
  });
}

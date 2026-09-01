"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BOOKING_STATUS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";

const updateBookingStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    BOOKING_STATUS.PENDING,
    BOOKING_STATUS.CONTACTED,
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.COMPLETED,
    BOOKING_STATUS.CANCELLED,
  ]),
});

export async function updateBookingStatus(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = updateBookingStatusSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid booking update: " + parsed.error.issues[0]?.message);
    }

    const supabase = await createClient();
    const { id, status } = parsed.data;

    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) throw new Error("Failed to update booking: " + error.message);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity: "booking",
      entity_id: id,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    return { id };
  });
}


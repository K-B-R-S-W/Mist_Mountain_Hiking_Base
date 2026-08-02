"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";
import { slugify } from "@/lib/utils/slugify";

const createRoomSchema = z.object({
  name: z.string().trim().min(1).max(200),
  shortDescription: z.string().trim().max(300).optional().or(z.literal("")),
  maxGuests: z.coerce.number().int().min(1).max(20),
  basePrice: z.coerce.number().min(0),
});

export async function createRoom(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = createRoomSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid room data: " + parsed.error.issues[0]?.message);
    }

    const supabase = await createClient();
    const baseSlug = slugify(parsed.data.name);
    if (!baseSlug) throw new Error("Room name must contain at least one letter or number.");

    // Slugs are immutable once created (spec.md §6) — resolve collisions
    // once, here, rather than ever regenerating a slug later.
    let slug = baseSlug;
    for (let suffix = 2; ; suffix++) {
      const { data: existing } = await supabase
        .from("rooms")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${suffix}`;
    }

    const { count } = await supabase
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false);

    const { data: room, error } = await supabase
      .from("rooms")
      .insert({
        slug,
        name: parsed.data.name,
        short_description: parsed.data.shortDescription || null,
        max_guests: parsed.data.maxGuests,
        base_price: parsed.data.basePrice,
        is_visible: false, // starts hidden — publish once photos/details are filled in
        sort_order: count ?? 0,
      })
      .select("id")
      .single();

    if (error || !room) {
      throw new Error("Failed to create room: " + (error?.message ?? "unknown error"));
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "create",
      entity: "room",
      entity_id: room.id,
    });

    revalidatePath("/admin/rooms");
    return { id: room.id };
  });
}

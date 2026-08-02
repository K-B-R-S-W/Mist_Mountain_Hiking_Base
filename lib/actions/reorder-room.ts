"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";

const schema = z.object({
  id: z.string().uuid(),
  direction: z.enum(["up", "down"]),
});

export async function reorderRoom(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async () => {
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid reorder request.");

    const supabase = await createClient();
    const { data: rooms, error } = await supabase
      .from("rooms")
      .select("id, sort_order")
      .eq("is_deleted", false)
      .order("sort_order", { ascending: true });
    if (error || !rooms) throw new Error("Failed to load room order.");

    const index = rooms.findIndex((r) => r.id === parsed.data.id);
    const swapIndex = parsed.data.direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapIndex < 0 || swapIndex >= rooms.length) {
      return { id: parsed.data.id }; // already at an edge — no-op
    }

    const current = rooms[index];
    const swapWith = rooms[swapIndex];
    if (!current || !swapWith) throw new Error("Failed to reorder rooms.");

    // Two updates, not one transaction — Supabase JS has no multi-statement
    // transaction API here. Worst case on a rare mid-swap failure is a
    // duplicate sort_order, which only affects display order and self-heals
    // on the next successful reorder.
    const [a, b] = await Promise.all([
      supabase.from("rooms").update({ sort_order: swapWith.sort_order }).eq("id", current.id),
      supabase.from("rooms").update({ sort_order: current.sort_order }).eq("id", swapWith.id),
    ]);
    if (a.error || b.error) throw new Error("Failed to reorder rooms.");

    revalidatePath("/rooms", "layout");
    revalidatePath("/admin/rooms");
    return { id: parsed.data.id };
  });
}

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/repositories/_shared";
import type { Amenity } from "@/lib/types/domain";

export async function getAllAmenities(): Promise<Amenity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("amenities")
    .select("id, name, icon")
    .order("name", { ascending: true });

  assertNoError(error, "Failed to load amenities");
  return data ?? [];
}

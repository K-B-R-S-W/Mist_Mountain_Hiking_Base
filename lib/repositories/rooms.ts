import "server-only";
import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/repositories/_shared";
import type { RoomDetail, RoomSummary } from "@/lib/types/domain";

function mapRoomSummary(row: {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  max_guests: number;
  base_price: number | string;
  featured: boolean;
  is_visible: boolean;
  sort_order: number;
  room_images?: Array<{
    sort_order: number;
    media_files: { url: string | null } | { url: string | null }[] | null;
  }> | null;
}): RoomSummary {
  const firstImage = (row.room_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => {
      if (!image.media_files) return null;
      if (Array.isArray(image.media_files)) {
        return image.media_files[0]?.url ?? null;
      }
      return image.media_files.url;
    })
    .find((url) => Boolean(url));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    maxGuests: row.max_guests,
    basePrice: Number(row.base_price),
    featured: row.featured,
    isVisible: row.is_visible,
    sortOrder: row.sort_order,
    primaryImageUrl: firstImage ?? null,
  };
}

export async function getVisibleRooms(): Promise<RoomSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select(
      "id, slug, name, short_description, max_guests, base_price, featured, is_visible, sort_order, room_images(sort_order, media_files(url))"
    )
    .eq("is_deleted", false)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  assertNoError(error, "Failed to load visible rooms");
  return (data ?? []).map(mapRoomSummary);
}

export async function getAdminRooms(): Promise<RoomSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select(
      "id, slug, name, short_description, max_guests, base_price, featured, is_visible, sort_order, room_images(sort_order, media_files(url))"
    )
    .eq("is_deleted", false)
    .order("sort_order", { ascending: true });

  assertNoError(error, "Failed to load admin rooms");
  return (data ?? []).map(mapRoomSummary);
}

const ROOM_DETAIL_SELECT =
  "id, slug, name, short_description, description, max_guests, base_price, featured, is_visible, sort_order, room_images(sort_order, media_id, media_files(url, alt)), room_amenities(amenities(id, name, icon))";

type RoomDetailRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  max_guests: number;
  base_price: number | string;
  featured: boolean;
  is_visible: boolean;
  sort_order: number;
  room_images?: Array<{
    sort_order: number;
    media_id: string;
    media_files: { url: string | null; alt: string | null } | { url: string | null; alt: string | null }[] | null;
  }> | null;
  room_amenities?: Array<{
    amenities: { id: string; name: string; icon: string | null } | { id: string; name: string; icon: string | null }[] | null;
  }> | null;
};

function mapRoomDetail(data: RoomDetailRow): RoomDetail {
  const summary = mapRoomSummary(data);
  const images = (data.room_images ?? [])
    .map((item) => {
      const media = Array.isArray(item.media_files) ? item.media_files[0] : item.media_files;
      if (!media?.url) return null;
      return {
        mediaId: item.media_id,
        sortOrder: item.sort_order,
        url: media.url,
        alt: media.alt ?? null,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const amenities = (data.room_amenities ?? [])
    .map((item) => {
      const amenity = Array.isArray(item.amenities) ? item.amenities[0] : item.amenities;
      if (!amenity) return null;
      return { id: amenity.id, name: amenity.name, icon: amenity.icon ?? null };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    ...summary,
    description: data.description,
    images,
    amenities,
  };
}

export async function getRoomBySlug(slug: string): Promise<RoomDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select(ROOM_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("is_deleted", false)
    .maybeSingle();

  assertNoError(error, "Failed to load room");
  return data ? mapRoomDetail(data) : null;
}

/** Admin equivalent of getRoomBySlug — looked up by id, no visibility filter
 * (admins need to see and edit hidden/unpublished rooms too). */
export async function getAdminRoomById(id: string): Promise<RoomDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select(ROOM_DETAIL_SELECT)
    .eq("id", id)
    .eq("is_deleted", false)
    .maybeSingle();

  assertNoError(error, "Failed to load room");
  return data ? mapRoomDetail(data) : null;
}


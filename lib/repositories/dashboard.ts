import "server-only";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUS } from "@/lib/constants";
import type { AdminDashboardSummary } from "@/lib/types/domain";

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const supabase = await createClient();

  const [
    totalRooms,
    visibleRooms,
    pendingBookings,
    visibleGalleryImages,
    approvedTestimonials,
    mediaLibrarySize,
  ] = await Promise.all([
    supabase
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false),
    supabase
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false)
      .eq("is_visible", true),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", BOOKING_STATUS.PENDING),
    supabase
      .from("gallery_images")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false)
      .eq("is_visible", true),
    supabase
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false)
      .eq("is_approved", true),
    supabase
      .from("media_files")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false),
  ]);

  const errors = [
    totalRooms.error,
    visibleRooms.error,
    pendingBookings.error,
    visibleGalleryImages.error,
    approvedTestimonials.error,
    mediaLibrarySize.error,
  ].filter((error) => Boolean(error));

  if (errors.length > 0) {
    throw new Error(`Failed to load dashboard summary: ${errors[0]?.message}`);
  }

  return {
    totalRooms: totalRooms.count ?? 0,
    visibleRooms: visibleRooms.count ?? 0,
    pendingBookings: pendingBookings.count ?? 0,
    visibleGalleryImages: visibleGalleryImages.count ?? 0,
    approvedTestimonials: approvedTestimonials.count ?? 0,
    mediaLibrarySize: mediaLibrarySize.count ?? 0,
  };
}


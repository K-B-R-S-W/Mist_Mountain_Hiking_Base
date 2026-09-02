import { getAdminMediaFiles } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";
import { MediaManager } from "@/components/admin/media/media-manager";

export default async function AdminMediaPage() {
  const supabase = await createClient();
  const [media, userRes] = await Promise.all([
    getAdminMediaFiles(),
    supabase.auth.getUser(),
  ]);

  const user = userRes.data.user;
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user?.id || "")
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
          Media Library
        </h1>
        <p className="mt-1 text-sm text-muted">
          Global cloud storage assets across rooms, hero banners, gallery items, testimonials, and branding marks.
        </p>
      </div>

      <MediaManager initialMedia={media} userRole={adminRow?.role || "admin"} />
    </div>
  );
}

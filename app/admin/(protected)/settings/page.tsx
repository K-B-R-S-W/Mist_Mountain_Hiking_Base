import { redirect } from "next/navigation";
import { getSiteBranding, getSiteSettings } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [settings, branding, userRes] = await Promise.all([
    getSiteSettings(),
    getSiteBranding(),
    supabase.auth.getUser(),
  ]);

  const user = userRes.data.user;
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user?.id || "")
    .maybeSingle();

  if (adminRow?.role === "staff") {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
          Global Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage visual branding, direct contact channels, Google integrations, and public narrative copy.
        </p>
      </div>

      <SettingsTabs settings={settings} branding={branding} />
    </div>
  );
}
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { ToastProvider } from "@/components/admin/ui/toast";
import { BOOKING_STATUS } from "@/lib/constants";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const [adminRowRes, pendingCountRes] = await Promise.all([
    supabase
      .from("admin_users")
      .select("user_id, role")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", BOOKING_STATUS.PENDING),
  ]);

  const adminRow = adminRowRes.data;
  if (!adminRow) redirect("/admin/login");

  const pendingCount = pendingCountRes.count ?? 0;
  const userRole = adminRow.role || "admin";
  const userEmail = user.email || "";

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background text-text">
        <AdminSidebar pendingCount={pendingCount} userEmail={userEmail} userRole={userRole} />
        <div className="flex flex-1 flex-col min-w-0">
          <AdminHeader pendingCount={pendingCount} userEmail={userEmail} userRole={userRole} />
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}

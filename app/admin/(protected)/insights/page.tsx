import { createClient } from "@/lib/supabase/server";
import { InsightsManager } from "@/components/admin/insights/insights-manager";

export default async function AdminInsightsPage() {
  const supabase = await createClient();

  const [unansweredRes, leadsRes, waitlistRes] = await Promise.all([
    supabase
      .from("chat_unanswered_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("chat_leads")
      .select("*, rooms(name)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("chat_waitlists")
      .select("*, rooms(name)")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const unanswered = (unansweredRes.data ?? []).map((row) => ({
    id: row.id,
    question: row.question,
    category: row.category,
    language: row.language,
    is_resolved: row.is_resolved,
    created_at: row.created_at,
  }));

  const leads = (leadsRes.data ?? []).map((row) => ({
    id: row.id,
    guest_name: row.guest_name,
    email: row.email,
    phone: row.phone,
    check_in: row.check_in,
    check_out: row.check_out,
    guests: row.guests,
    type: row.type,
    status: row.status,
    created_at: row.created_at,
    rooms: Array.isArray(row.rooms) ? row.rooms[0] : row.rooms,
  }));

  const waitlists = (waitlistRes.data ?? []).map((row) => ({
    id: row.id,
    guest_name: row.guest_name,
    contact_info: row.contact_info,
    check_in: row.check_in,
    check_out: row.check_out,
    guests: row.guests,
    status: row.status,
    created_at: row.created_at,
    rooms: Array.isArray(row.rooms) ? row.rooms[0] : row.rooms,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
          AI Concierge Insights
        </h1>
        <p className="mt-1 text-sm text-muted">
          Track unanswered questions, manage captured partial booking leads, and notify waitlisted guests when rooms open.
        </p>
      </div>

      <InsightsManager
        initialUnanswered={unanswered}
        initialLeads={leads}
        initialWaitlists={waitlists}
      />
    </div>
  );
}

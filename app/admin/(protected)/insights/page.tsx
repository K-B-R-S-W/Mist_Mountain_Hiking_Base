import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { HelpCircle, UserPlus, Bell, CheckCircle2, Trash2 } from "lucide-react";

export default async function AdminInsightsPage() {
  const supabase = await createClient();

  const [unansweredRes, leadsRes, waitlistRes] = await Promise.all([
    supabase
      .from("chat_unanswered_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("chat_leads")
      .select("*, rooms(name)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("chat_waitlists")
      .select("*, rooms(name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const unanswered = unansweredRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const waitlists = waitlistRes.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-primary">
          AI Concierge Insights & Leads
        </h1>
        <p className="mt-2 text-sm text-muted">
          Review unanswered guest queries, follow up on partial booking leads, and view waitlist requests.
        </p>
      </div>

      {/* Section 1: Unanswered Questions */}
      <section className="rounded-xl border border-black/10 bg-surface p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 pb-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-base">
            <HelpCircle className="h-5 w-5 text-accent" />
            <h2>Unanswered Questions & Content Gaps ({unanswered.length})</h2>
          </div>
          <span className="text-xs text-muted">Auto-logged when guest needs human assistance</span>
        </div>

        {unanswered.length === 0 ? (
          <p className="text-xs text-muted py-3">No unanswered questions logged yet. Everything is running smoothly!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/5 text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Question Asked</th>
                  <th className="py-2.5 px-3">Lang</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {unanswered.map((row) => (
                  <tr key={row.id} className="hover:bg-black/2">
                    <td className="py-2.5 px-3 text-muted whitespace-nowrap">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-text">{row.question}</td>
                    <td className="py-2.5 px-3 uppercase text-muted">{row.language}</td>
                    <td className="py-2.5 px-3">
                      {row.is_resolved ? (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                          Resolved
                        </span>
                      ) : (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                          Needs FAQ
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <form
                        action={async () => {
                          "use server";
                          const client = await createClient();
                          await client
                            .from("chat_unanswered_logs")
                            .update({ is_resolved: !row.is_resolved })
                            .eq("id", row.id);
                          revalidatePath("/admin/insights");
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded border border-black/10 px-2 py-1 text-[10px] font-medium text-text hover:bg-black/5"
                        >
                          {row.is_resolved ? "Mark Unresolved" : "Mark Resolved"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 2: Abandoned Leads */}
      <section className="rounded-xl border border-black/10 bg-surface p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 pb-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-base">
            <UserPlus className="h-5 w-5 text-secondary" />
            <h2>Abandoned Booking & Group Leads ({leads.length})</h2>
          </div>
          <span className="text-xs text-muted">Guests who entered contact info but didn&apos;t confirm</span>
        </div>

        {leads.length === 0 ? (
          <p className="text-xs text-muted py-3">No abandoned leads captured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/5 text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Guest</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Dates</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-black/2">
                    <td className="py-2.5 px-3 text-muted whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-text">{lead.guest_name || "Anonymous Lead"}</p>
                      <p className="text-[11px] text-muted">{lead.email || lead.phone || "No contact info"}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-black/5 px-2 py-0.5 text-[10px] font-medium text-text capitalize">
                        {lead.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted">
                      {lead.check_in ? `${lead.check_in} → ${lead.check_out}` : "Not selected"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800 capitalize">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {lead.phone || lead.email ? (
                        <a
                          href={lead.phone ? `tel:${lead.phone}` : `mailto:${lead.email}`}
                          className="rounded bg-primary px-2.5 py-1 text-[10px] font-medium text-background hover:bg-secondary transition"
                        >
                          Contact
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 3: Sold-Out Date Waitlists */}
      <section className="rounded-xl border border-black/10 bg-surface p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 pb-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-base">
            <Bell className="h-5 w-5 text-accent" />
            <h2>Sold-Out Date Waitlists ({waitlists.length})</h2>
          </div>
          <span className="text-xs text-muted">Guests wanting alert if rooms open</span>
        </div>

        {waitlists.length === 0 ? (
          <p className="text-xs text-muted py-3">No waitlist entries currently.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/5 text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Guest & Contact</th>
                  <th className="py-2.5 px-3">Dates Wanted</th>
                  <th className="py-2.5 px-3">Guests</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {waitlists.map((w) => (
                  <tr key={w.id} className="hover:bg-black/2">
                    <td className="py-2.5 px-3 text-muted whitespace-nowrap">
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-text">{w.guest_name}</p>
                      <p className="text-[11px] text-muted">{w.contact_info}</p>
                    </td>
                    <td className="py-2.5 px-3 text-muted">
                      {w.check_in ? `${w.check_in} → ${w.check_out}` : "Flexible"}
                    </td>
                    <td className="py-2.5 px-3">{w.guests ?? 2}</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 capitalize">
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

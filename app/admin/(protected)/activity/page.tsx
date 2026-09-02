import { createClient } from "@/lib/supabase/server";
import { History, Clock, FileText, User } from "lucide-react";

export default async function AdminActivityPage() {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("activity_logs")
    .select("id, user_id, action, entity, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const rawLogs = logs || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
          Activity Audit Log
        </h1>
        <p className="mt-1 text-sm text-muted">
          Complete chronological record of all administrative modifications, publishing actions, and data updates.
        </p>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-black/8 pb-3">
          <History className="h-5 w-5 text-accent" />
          <h2 className="font-semibold text-base text-text">Recent Administrative Actions ({rawLogs.length})</h2>
        </div>

        {rawLogs.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">No activity records logged yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-black/8 bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/8 bg-black/2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6 text-xs">
                {rawLogs.map((log) => {
                  const actionColor =
                    log.action === "create"
                      ? "bg-emerald-100 text-emerald-800"
                      : log.action === "delete"
                      ? "bg-rose-100 text-rose-800"
                      : log.action === "notify"
                      ? "bg-sky-100 text-sky-800"
                      : "bg-amber-100 text-amber-800";

                  return (
                    <tr key={log.id} className="hover:bg-black/2 transition-colors">
                      <td className="py-3 px-4 text-muted whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted" />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${actionColor}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-text capitalize">
                        {log.entity.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted text-[11px]">
                        {log.entity_id ? log.entity_id.slice(0, 13) + "..." : "—"}
                      </td>
                      <td className="py-3 px-4 text-muted">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted" />
                          <span className="font-mono text-[10px]">{log.user_id ? log.user_id.slice(0, 8) : "System"}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  updateChatLeadStatus,
  updateChatWaitlistStatus,
  notifyWaitlistGuest,
  toggleUnansweredLog,
} from "@/lib/actions/chat-insights";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { useToast } from "@/components/admin/ui/toast";
import {
  HelpCircle,
  UserPlus,
  Bell,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  Send,
  Loader2,
  Users,
} from "lucide-react";

interface UnansweredItem {
  id: string;
  question: string;
  category: string;
  language: string;
  is_resolved: boolean;
  created_at: string;
}

interface LeadItem {
  id: string;
  guest_name: string | null;
  email: string | null;
  phone: string | null;
  check_in: string | null;
  check_out: string | null;
  guests: number | null;
  type: string;
  status: "new" | "contacted" | "converted" | "archived";
  created_at: string;
  rooms?: { name: string } | null;
}

interface WaitlistItem {
  id: string;
  guest_name: string;
  contact_info: string;
  check_in: string | null;
  check_out: string | null;
  guests: number | null;
  status: "pending" | "notified" | "expired" | "archived";
  created_at: string;
  rooms?: { name: string } | null;
}

export function InsightsManager({
  initialUnanswered,
  initialLeads,
  initialWaitlists,
}: {
  initialUnanswered: UnansweredItem[];
  initialLeads: LeadItem[];
  initialWaitlists: WaitlistItem[];
}) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"unanswered" | "leads" | "waitlists">("unanswered");
  const [unanswered, setUnanswered] = useState<UnansweredItem[]>(initialUnanswered);
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [waitlists, setWaitlists] = useState<WaitlistItem[]>(initialWaitlists);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const handleToggleUnanswered = async (id: string, currentStatus: boolean) => {
    setUnanswered((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_resolved: !currentStatus } : item))
    );

    const result = await toggleUnansweredLog({ id, isResolved: !currentStatus });

    if (!result.ok) {
      setUnanswered((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_resolved: currentStatus } : item))
      );
      toast.error("Failed to update status.");
    } else {
      toast.success(!currentStatus ? "Question marked as resolved." : "Question marked as unresolved.");
    }
  };

  const handleLeadStatusChange = async (id: string, newStatus: LeadItem["status"]) => {
    const orig = leads.find((l) => l.id === id);
    if (!orig || orig.status === newStatus) return;

    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));

    const result = await updateChatLeadStatus({ id, status: newStatus });
    if (!result.ok) {
      setLeads((prev) => prev.map((l) => (l.id === id ? orig : l)));
      toast.error(result.error);
    } else {
      toast.success(`Lead status updated to ${newStatus}.`);
    }
  };

  const handleWaitlistStatusChange = async (id: string, newStatus: WaitlistItem["status"]) => {
    const orig = waitlists.find((w) => w.id === id);
    if (!orig || orig.status === newStatus) return;

    setWaitlists((prev) => prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w)));

    const result = await updateChatWaitlistStatus({ id, status: newStatus });
    if (!result.ok) {
      setWaitlists((prev) => prev.map((w) => (w.id === id ? orig : w)));
      toast.error(result.error);
    } else {
      toast.success(`Waitlist status updated to ${newStatus}.`);
    }
  };

  const handleNotifyGuest = async (w: WaitlistItem) => {
    setNotifyingId(w.id);
    try {
      const result = await notifyWaitlistGuest({
        id: w.id,
        guestName: w.guest_name,
        contactInfo: w.contact_info,
        roomName: w.rooms?.name || null,
        checkIn: w.check_in,
        checkOut: w.check_out,
      });

      if (!result.ok) {
        toast.error(result.error);
      } else {
        setWaitlists((prev) =>
          prev.map((item) => (item.id === w.id ? { ...item, status: "notified" } : item))
        );
        toast.success(`Availability alert sent to ${w.guest_name}.`);
      }
    } catch {
      toast.error("Failed to notify guest.");
    } finally {
      setNotifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-black/8 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("unanswered")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === "unanswered"
              ? "bg-primary text-background shadow-xs"
              : "text-muted hover:text-text hover:bg-black/4"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Unanswered Questions</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "unanswered" ? "bg-accent text-white" : "bg-black/8 text-text"
            }`}
          >
            {unanswered.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === "leads"
              ? "bg-primary text-background shadow-xs"
              : "text-muted hover:text-text hover:bg-black/4"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>Partial Leads & Group Inquiries</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "leads" ? "bg-accent text-white" : "bg-black/8 text-text"
            }`}
          >
            {leads.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("waitlists")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === "waitlists"
              ? "bg-primary text-background shadow-xs"
              : "text-muted hover:text-text hover:bg-black/4"
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Sold-Out Date Waitlists</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "waitlists" ? "bg-accent text-white" : "bg-black/8 text-text"
            }`}
          >
            {waitlists.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Unanswered Questions */}
      {activeTab === "unanswered" && (
        <section className="card p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-base text-text">Content Gaps & Unanswered Queries</h2>
            <p className="text-xs text-muted">
              Auto-logged whenever the AI Concierge cannot answer a guest question with high confidence.
            </p>
          </div>

          {unanswered.length === 0 ? (
            <p className="text-xs text-muted py-8 text-center">
              No unanswered questions recorded. The concierge knowledge base is covering all guest queries!
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-black/8 bg-surface">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/8 bg-black/2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Guest Question</th>
                    <th className="py-2.5 px-3">Lang</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6">
                  {unanswered.map((row) => (
                    <tr key={row.id} className="hover:bg-black/2 transition-colors">
                      <td className="py-3 px-3 text-muted whitespace-nowrap">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-medium text-text">{row.question}</td>
                      <td className="py-3 px-3 uppercase font-mono text-muted">{row.language}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={row.is_resolved ? "completed" : "pending"} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleUnanswered(row.id, row.is_resolved)}
                          className="btn-secondary text-[11px] py-1 px-2.5"
                        >
                          {row.is_resolved ? "Mark Unresolved" : "Mark Resolved"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Partial Booking Leads */}
      {activeTab === "leads" && (
        <section className="card p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-base text-text">Partial Leads & Inquiries</h2>
            <p className="text-xs text-muted">
              Guests who provided contact info during AI concierge conversations but have not confirmed.
            </p>
          </div>

          {leads.length === 0 ? (
            <p className="text-xs text-muted py-8 text-center">No partial leads captured yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-black/8 bg-surface">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/8 bg-black/2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Guest & Contact</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Stay Dates</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Follow-up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-black/2 transition-colors">
                      <td className="py-3 px-3 text-muted whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-text">{lead.guest_name || "Anonymous Guest"}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted">
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="hover:text-primary transition">
                              {lead.email}
                            </a>
                          )}
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="hover:text-primary transition">
                              {lead.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 capitalize text-muted">
                        {lead.type.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-3 text-muted">
                        {lead.check_in && lead.check_out
                          ? `${lead.check_in} → ${lead.check_out}`
                          : "Not selected"}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleLeadStatusChange(lead.id, e.target.value as LeadItem["status"])
                          }
                          className="form-input py-1 text-xs capitalize cursor-pointer"
                        >
                          <option value="new">New Lead</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="btn-secondary p-1.5 h-7 w-7 text-primary"
                              title="Call guest"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="btn-primary p-1.5 h-7 w-7 text-xs"
                              title="Email guest"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Sold-Out Date Waitlists */}
      {activeTab === "waitlists" && (
        <section className="card p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-base text-text">Sold-Out Date Waitlists</h2>
            <p className="text-xs text-muted">
              Guests waiting for openings on booked dates. Click &ldquo;Notify Guest&rdquo; to send an automated availability email.
            </p>
          </div>

          {waitlists.length === 0 ? (
            <p className="text-xs text-muted py-8 text-center">No active waitlist requests.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-black/8 bg-surface">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/8 bg-black/2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Guest & Contact</th>
                    <th className="py-2.5 px-3">Dates Wanted</th>
                    <th className="py-2.5 px-3">Party</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Alert Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6">
                  {waitlists.map((w) => {
                    const isNotifying = notifyingId === w.id;

                    return (
                      <tr key={w.id} className="hover:bg-black/2 transition-colors">
                        <td className="py-3 px-3 text-muted whitespace-nowrap">
                          {new Date(w.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-text">{w.guest_name}</p>
                          <p className="text-[11px] text-muted">{w.contact_info}</p>
                        </td>
                        <td className="py-3 px-3 text-muted">
                          {w.check_in && w.check_out
                            ? `${w.check_in} → ${w.check_out}`
                            : "Flexible"}
                        </td>
                        <td className="py-3 px-3 text-muted">{w.guests ?? 2} guests</td>
                        <td className="py-3 px-3">
                          <select
                            value={w.status}
                            onChange={(e) =>
                              handleWaitlistStatusChange(w.id, e.target.value as WaitlistItem["status"])
                            }
                            className="form-input py-1 text-xs capitalize cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="notified">Notified</option>
                            <option value="expired">Expired</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            disabled={isNotifying || w.status === "notified"}
                            onClick={() => handleNotifyGuest(w)}
                            className="btn-primary text-[11px] py-1 px-2.5 gap-1.5"
                          >
                            {isNotifying ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : w.status === "notified" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                <span>Notified</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3" />
                                <span>Notify Guest</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

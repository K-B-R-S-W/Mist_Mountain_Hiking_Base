"use client";

import { useState, useTransition } from "react";
import { createRoomBlock, deleteRoomBlock } from "@/lib/actions/room-blocks";
import { ConfirmButton } from "@/components/admin/ui/confirm-dialog";
import { useToast } from "@/components/admin/ui/toast";
import { CalendarRange, Plus, Trash2, Calendar, Loader2, Filter } from "lucide-react";

interface RoomOption {
  id: string;
  name: string;
}

interface RoomBlockItem {
  id: string;
  roomId: string;
  roomName: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  source: "manual" | "booking";
  createdAt: string;
}

export function AvailabilityManager({
  rooms,
  initialBlocks,
}: {
  rooms: RoomOption[];
  initialBlocks: RoomBlockItem[];
}) {
  const toast = useToast();
  const [blocks, setBlocks] = useState<RoomBlockItem[]>(initialBlocks);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  // Form State
  const [formData, setFormData] = useState({
    roomId: rooms[0]?.id || "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const filteredBlocks = blocks.filter(
    (b) => selectedRoomFilter === "all" || b.roomId === selectedRoomFilter
  );

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomId || !formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createRoomBlock(formData);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        const room = rooms.find((r) => r.id === formData.roomId);
        const newBlock: RoomBlockItem = {
          id: result.data.id,
          roomId: formData.roomId,
          roomName: room?.name || "Room",
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason,
          source: "manual",
          createdAt: new Date().toISOString(),
        };
        setBlocks((prev) => [newBlock, ...prev]);
        setFormData({
          roomId: rooms[0]?.id || "",
          startDate: "",
          endDate: "",
          reason: "",
        });
        toast.success("Room block created successfully.");
      }
    } catch {
      toast.error("An error occurred while creating the block.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    startTransition(async () => {
      try {
        const result = await deleteRoomBlock({ id });
        if (!result.ok) {
          toast.error(result.error);
        } else {
          setBlocks((prev) => prev.filter((b) => b.id !== id));
          toast.success("Room block removed.");
        }
      } catch {
        toast.error("Failed to remove room block.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Create Manual Block Form */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2 border-b border-black/8 pb-3">
          <CalendarRange className="h-5 w-5 text-accent" />
          <h2 className="font-semibold text-base text-text">Block Room Dates</h2>
        </div>
        <p className="text-xs text-muted">
          Manually prevent bookings for maintenance, owner reservations, or external OTA blocks.
        </p>

        <form onSubmit={handleCreateBlock} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="form-field">
            <label htmlFor="block-room" className="text-xs font-medium text-text">
              Room
            </label>
            <select
              id="block-room"
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              required
              className="form-input"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="block-start" className="text-xs font-medium text-text">
              Start Date
            </label>
            <input
              id="block-start"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="block-end" className="text-xs font-medium text-text">
              End Date
            </label>
            <input
              id="block-end"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="block-reason" className="text-xs font-medium text-text">
              Reason / Note
            </label>
            <input
              id="block-reason"
              type="text"
              placeholder="e.g. Roof maintenance, Owner use"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating block...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Date Block
                </span>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Existing Blocks List */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-lg text-text">Active Date Blocks ({filteredBlocks.length})</h2>
            <p className="text-xs text-muted">All blocked dates affecting public availability and chatbot quotes.</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted" />
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="form-input py-1.5 text-xs font-medium"
            >
              <option value="all">All Rooms</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredBlocks.length === 0 ? (
          <div className="card text-center py-10 space-y-2">
            <p className="text-sm font-medium text-text">No date blocks recorded</p>
            <p className="text-xs text-muted">All dates are currently open for booking according to room rules.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/8 bg-black/2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Date Range</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6">
                {filteredBlocks.map((b) => (
                  <tr key={b.id} className="hover:bg-black/2 transition-colors">
                    <td className="py-3 px-4 font-medium text-text">{b.roomName}</td>
                    <td className="py-3 px-4 text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-text">
                        <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
                        <span>{b.startDate} → {b.endDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted">
                      {b.reason || "Manual Block"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          b.source === "manual"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {b.source === "manual" ? "Manual Block" : "Booking"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.source === "manual" ? (
                        <ConfirmButton
                          confirmTitle="Remove Date Block"
                          confirmMessage={`Are you sure you want to remove the block for ${b.roomName} (${b.startDate} to ${b.endDate})? Dates will be open for booking.`}
                          confirmLabel="Remove Block"
                          variant="danger"
                          onConfirm={() => handleDeleteBlock(b.id)}
                          className="btn-danger text-xs px-2.5 py-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </ConfirmButton>
                      ) : (
                        <span className="text-xs text-muted">Managed by Booking</span>
                      )}
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

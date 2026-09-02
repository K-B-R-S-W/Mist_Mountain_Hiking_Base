import Image from "next/image";
import Link from "next/link";
import { getAdminRooms } from "@/lib/repositories";
import { reorderRoom } from "@/lib/actions/reorder-room";
import { deleteRoom } from "@/lib/actions/delete-room";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { ConfirmButton } from "@/components/admin/ui/confirm-dialog";
import { Plus, ChevronUp, ChevronDown, Edit3, Trash2, Users, BedDouble, Star } from "lucide-react";

export default async function AdminRoomsPage() {
  const rooms = await getAdminRooms();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/8 pb-5">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
            Rooms & Suites
          </h1>
          <p className="mt-1 text-sm text-muted">
            {rooms.length} room{rooms.length === 1 ? "" : "s"} listed. Reordering directly controls display order on the public website.
          </p>
        </div>
        <Link href="/admin/rooms/new" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          <span>New Room</span>
        </Link>
      </div>

      <div className="space-y-3">
        {rooms.map((room, index) => (
          <div
            key={room.id}
            className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:border-black/15 transition-all shadow-xs"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-black/5 border border-black/8">
                {room.primaryImageUrl ? (
                  <Image
                    src={room.primaryImageUrl}
                    alt={room.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted">
                    <BedDouble className="h-6 w-6 opacity-40" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-base text-text truncate">{room.name}</h2>
                  <StatusBadge status={room.isVisible ? "visible" : "hidden"} />
                  {room.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Up to {room.maxGuests} guests
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-text tabular-nums">
                    LKR {room.basePrice.toLocaleString()} / night
                  </span>
                </div>
                {room.shortDescription && (
                  <p className="text-xs text-muted truncate max-w-md">{room.shortDescription}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-black/6">
              <div className="flex items-center gap-1">
                <form
                  action={async () => {
                    "use server";
                    await reorderRoom({ id: room.id, direction: "up" });
                  }}
                >
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="btn-icon h-9 w-9 text-muted hover:text-text"
                    aria-label={`Move ${room.name} up`}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await reorderRoom({ id: room.id, direction: "down" });
                  }}
                >
                  <button
                    type="submit"
                    disabled={index === rooms.length - 1}
                    className="btn-icon h-9 w-9 text-muted hover:text-text"
                    aria-label={`Move ${room.name} down`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <Link href={`/admin/rooms/${room.id}`} className="btn-secondary h-9 text-xs px-3">
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Link>

              <ConfirmButton
                confirmTitle={`Delete "${room.name}"?`}
                confirmMessage="Are you sure? This room will be hidden from the website immediately and all photo associations removed."
                confirmLabel="Delete Room"
                variant="danger"
                onConfirm={async () => {
                  "use server";
                  await deleteRoom({ id: room.id });
                }}
                className="btn-danger h-9 text-xs px-3"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </ConfirmButton>
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="card text-center py-12 space-y-3">
            <BedDouble className="h-10 w-10 text-muted mx-auto" />
            <p className="font-medium text-text">No rooms created yet</p>
            <p className="text-xs text-muted">Get started by adding your first mountain accommodation suite.</p>
            <Link href="/admin/rooms/new" className="btn-primary text-xs inline-flex mt-2">
              <Plus className="h-4 w-4" />
              <span>Create First Room</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

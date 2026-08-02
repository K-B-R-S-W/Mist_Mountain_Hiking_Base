import Image from "next/image";
import Link from "next/link";
import { getAdminRooms } from "@/lib/repositories";
import { reorderRoom } from "@/lib/actions/reorder-room";
import { deleteRoom } from "@/lib/actions/delete-room";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function AdminRoomsPage() {
  const rooms = await getAdminRooms();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-primary">Rooms</h1>
          <p className="mt-2 text-sm text-muted">
            {rooms.length} room{rooms.length === 1 ? "" : "s"}. Order here sets the public listing order.
          </p>
        </div>
        <Link href="/admin/rooms/new" className="btn-primary shrink-0">
          New room
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {rooms.map((room, index) => (
          <div key={room.id} className="card flex flex-wrap items-center gap-4">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-[var(--radius-card-inner)] bg-black/5">
              {room.primaryImageUrl ? (
                <Image src={room.primaryImageUrl} alt="" fill sizes="96px" className="object-cover" />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{room.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                Up to {room.maxGuests} guests · LKR {room.basePrice.toLocaleString()}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className={`badge ${room.isVisible ? "" : "opacity-50"}`}>
                {room.isVisible ? "Visible" : "Hidden"}
              </span>
              {room.featured ? <span className="badge">Featured</span> : null}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <form
                action={async () => {
                  "use server";
                  await reorderRoom({ id: room.id, direction: "up" });
                }}
              >
                <button
                  type="submit"
                  disabled={index === 0}
                  className="btn-secondary"
                  aria-label={`Move ${room.name} up`}
                >
                  ↑
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
                  className="btn-secondary"
                  aria-label={`Move ${room.name} down`}
                >
                  ↓
                </button>
              </form>
            </div>

            <Link href={`/admin/rooms/${room.id}`} className="link-inline shrink-0">
              Edit
            </Link>

            <form
              action={async () => {
                "use server";
                await deleteRoom({ id: room.id });
              }}
              className="shrink-0"
            >
              <ConfirmSubmitButton
                confirmMessage={`Delete "${room.name}"? It will be hidden everywhere immediately.`}
                className="btn-danger"
              >
                Delete
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}

        {rooms.length === 0 ? <p className="card text-sm text-muted">No rooms yet. Create the first one.</p> : null}
      </div>
    </div>
  );
}

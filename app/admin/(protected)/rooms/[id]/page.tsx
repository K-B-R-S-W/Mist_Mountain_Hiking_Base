import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getAdminRoomById, getAllAmenities } from "@/lib/repositories";
import { updateRoom } from "@/lib/actions/update-room";
import { deleteRoom } from "@/lib/actions/delete-room";
import { addRoomImage, removeRoomImage, reorderRoomImage } from "@/lib/actions/room-images";
import { setRoomAmenities, createAmenity } from "@/lib/actions/room-amenities";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [room, amenities] = await Promise.all([getAdminRoomById(id), getAllAmenities()]);
  if (!room) notFound();

  const selectedAmenityIds = new Set(room.amenities.map((a) => a.id));

  async function handleUpdateDetails(formData: FormData) {
    "use server";
    await updateRoom({
      id,
      name: formData.get("name"),
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      maxGuests: formData.get("maxGuests"),
      basePrice: formData.get("basePrice"),
      isVisible: formData.get("isVisible") === "on",
      featured: formData.get("featured") === "on",
    });
  }

  async function handleAddImage(formData: FormData) {
    "use server";
    formData.set("roomId", id);
    await addRoomImage(formData);
  }

  async function handleSetAmenities(formData: FormData) {
    "use server";
    await setRoomAmenities({ roomId: id, amenityIds: formData.getAll("amenityIds") });
  }

  async function handleAddAmenity(formData: FormData) {
    "use server";
    await createAmenity({ name: formData.get("name") });
  }

  async function handleDelete() {
    "use server";
    await deleteRoom({ id });
    redirect("/admin/rooms");
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words font-[family-name:var(--font-fraunces)] text-2xl text-primary">{room.name}</h1>
          <p className="mt-1 text-xs text-muted">/rooms/{room.slug}</p>
        </div>
        <form action={handleDelete}>
          <ConfirmSubmitButton
            confirmMessage={`Delete "${room.name}"? It will be hidden everywhere immediately.`}
            className="btn-danger"
          >
            Delete room
          </ConfirmSubmitButton>
        </form>
      </div>

      <section className="card mt-6">
        <h2 className="text-lg">Details</h2>
        <form action={handleUpdateDetails} className="mt-4 space-y-4">
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" defaultValue={room.name} required className="form-input" />
          </div>
          <div className="form-field">
            <label htmlFor="shortDescription">Short description</label>
            <input
              id="shortDescription"
              name="shortDescription"
              defaultValue={room.shortDescription ?? ""}
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label htmlFor="description">Full description</label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={room.description ?? ""}
              className="form-input resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <label htmlFor="maxGuests">Max guests</label>
              <input
                id="maxGuests"
                name="maxGuests"
                type="number"
                min={1}
                defaultValue={room.maxGuests}
                required
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label htmlFor="basePrice">Base price (LKR)</label>
              <input
                id="basePrice"
                name="basePrice"
                type="number"
                min={0}
                step="0.01"
                defaultValue={room.basePrice}
                required
                className="form-input"
              />
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <label className="inline-flex items-center gap-2">
              <input name="isVisible" type="checkbox" defaultChecked={room.isVisible} />
              Visible on site
            </label>
            <label className="inline-flex items-center gap-2">
              <input name="featured" type="checkbox" defaultChecked={room.featured} />
              Featured on homepage
            </label>
          </div>
          <button type="submit" className="btn-primary">
            Save details
          </button>
        </form>
      </section>

      <section className="card mt-6">
        <h2 className="text-lg">Images</h2>
        <p className="mt-1 text-sm text-muted">First image is used as the listing thumbnail.</p>

        {room.images.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {room.images.map((image, index) => (
              <div key={image.mediaId} className="space-y-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card-inner)] bg-black/5">
                  <Image src={image.url} alt={image.alt ?? ""} fill sizes="240px" className="object-cover" />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <form
                    action={async () => {
                      "use server";
                      await reorderRoomImage({ roomId: id, mediaId: image.mediaId, direction: "up" });
                    }}
                  >
                    <button type="submit" disabled={index === 0} className="btn-secondary" aria-label="Move image earlier">
                      ↑
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await reorderRoomImage({ roomId: id, mediaId: image.mediaId, direction: "down" });
                    }}
                  >
                    <button
                      type="submit"
                      disabled={index === room.images.length - 1}
                      className="btn-secondary"
                      aria-label="Move image later"
                    >
                      ↓
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await removeRoomImage({ roomId: id, mediaId: image.mediaId });
                    }}
                  >
                    <ConfirmSubmitButton confirmMessage="Remove this image from the room?" className="btn-danger">
                      Remove
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">No images yet.</p>
        )}

        <form action={handleAddImage} encType="multipart/form-data" className="mt-6 flex flex-wrap items-end gap-3">
          <div className="form-field">
            <label htmlFor="file">Add image</label>
            <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
          </div>
          <div className="form-field flex-1">
            <label htmlFor="alt">Alt text</label>
            <input id="alt" name="alt" placeholder="Describe the image" className="form-input" />
          </div>
          <button type="submit" className="btn-primary">
            Upload
          </button>
        </form>
      </section>

      <section className="card mt-6">
        <h2 className="text-lg">Amenities</h2>
        <form action={handleSetAmenities} className="mt-4">
          <div className="flex flex-wrap gap-3 text-sm">
            {amenities.map((amenity) => (
              <label key={amenity.id} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="amenityIds"
                  value={amenity.id}
                  defaultChecked={selectedAmenityIds.has(amenity.id)}
                />
                {amenity.name}
              </label>
            ))}
            {amenities.length === 0 ? <p className="text-muted">No amenities defined yet.</p> : null}
          </div>
          <button type="submit" className="btn-primary mt-4">
            Save amenities
          </button>
        </form>

        <form action={handleAddAmenity} className="mt-6 flex items-end gap-3 border-t border-black/5 pt-4">
          <div className="form-field">
            <label htmlFor="amenityName">New amenity</label>
            <input id="amenityName" name="name" placeholder="e.g. Spring pool access" className="form-input" />
          </div>
          <button type="submit" className="btn-secondary">
            Add
          </button>
        </form>
      </section>
    </div>
  );
}

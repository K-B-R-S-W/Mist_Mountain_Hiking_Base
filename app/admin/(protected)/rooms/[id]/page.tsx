import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAdminRoomById, getAllAmenities } from "@/lib/repositories";
import { updateRoom } from "@/lib/actions/update-room";
import { deleteRoom } from "@/lib/actions/delete-room";
import { addRoomImage, removeRoomImage, reorderRoomImage } from "@/lib/actions/room-images";
import { setRoomAmenities, createAmenity } from "@/lib/actions/room-amenities";
import { ConfirmButton } from "@/components/admin/ui/confirm-dialog";
import { ActionButton } from "@/components/admin/ui/action-button";
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  Save,
  Upload,
  Plus,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Sparkles,
  Check,
} from "lucide-react";

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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/8 pb-4">
        <div>
          <Link
            href="/admin/rooms"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Rooms</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
              {room.name}
            </h1>
            <a
              href={`/rooms/${room.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary transition"
            >
              <span>/rooms/{room.slug}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <ConfirmButton
          confirmTitle={`Delete "${room.name}"?`}
          confirmMessage="Are you sure? This room will be permanently removed from public view and all attached photo records deleted."
          confirmLabel="Delete Room"
          variant="danger"
          onConfirm={handleDelete}
          className="btn-danger"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Room</span>
        </ConfirmButton>
      </div>

      {/* Section 1: Room Details & Pricing */}
      <section className="card space-y-4">
        <h2 className="font-semibold text-lg text-text border-b border-black/8 pb-2">
          Room Details & Pricing
        </h2>

        <form action={handleUpdateDetails} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-field md:col-span-2">
              <label htmlFor="name" className="text-xs font-medium text-text">
                Room Name
              </label>
              <input
                id="name"
                name="name"
                defaultValue={room.name}
                required
                className="form-input"
              />
            </div>

            <div className="form-field md:col-span-2">
              <label htmlFor="shortDescription" className="text-xs font-medium text-text">
                Short Description (Listing Subtitle)
              </label>
              <input
                id="shortDescription"
                name="shortDescription"
                defaultValue={room.shortDescription ?? ""}
                placeholder="e.g. Panoramic forest views with private spring plunge pool"
                className="form-input"
              />
            </div>

            <div className="form-field md:col-span-2">
              <label htmlFor="description" className="text-xs font-medium text-text">
                Full Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={room.description ?? ""}
                placeholder="Detailed room features, bed configuration, bathroom details, view, etc."
                className="form-input resize-y"
              />
            </div>

            <div className="form-field">
              <label htmlFor="maxGuests" className="text-xs font-medium text-text">
                Max Guests Capacity
              </label>
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
              <label htmlFor="basePrice" className="text-xs font-medium text-text">
                Base Price per Night (LKR)
              </label>
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

          <div className="flex flex-wrap gap-6 border-t border-black/6 pt-4">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-text cursor-pointer">
              <input
                name="isVisible"
                type="checkbox"
                defaultChecked={room.isVisible}
                className="h-4 w-4 rounded text-primary focus:ring-accent"
              />
              Visible on Public Website
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-text cursor-pointer">
              <input
                name="featured"
                type="checkbox"
                defaultChecked={room.featured}
                className="h-4 w-4 rounded text-primary focus:ring-accent"
              />
              Featured on Homepage
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <ActionButton pendingLabel="Saving details...">
              <Save className="h-4 w-4" />
              <span>Save Room Details</span>
            </ActionButton>
          </div>
        </form>
      </section>

      {/* Section 2: Room Photos Gallery */}
      <section className="card space-y-4">
        <div>
          <h2 className="font-semibold text-lg text-text">Photo Gallery ({room.images.length})</h2>
          <p className="text-xs text-muted">
            The first photo is automatically used as the primary listing thumbnail on the public site.
          </p>
        </div>

        {room.images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {room.images.map((image, index) => (
              <div
                key={image.mediaId}
                className="group relative rounded-xl border border-black/10 bg-background overflow-hidden shadow-xs space-y-2 p-2"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black/5">
                  <Image
                    src={image.url}
                    alt={image.alt ?? ""}
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary text-background shadow-sm">
                      Cover Photo
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 pt-1">
                  <div className="flex items-center gap-1">
                    <form
                      action={async () => {
                        "use server";
                        await reorderRoomImage({
                          roomId: id,
                          mediaId: image.mediaId,
                          direction: "up",
                        });
                      }}
                    >
                      <button
                        type="submit"
                        disabled={index === 0}
                        className="btn-icon h-7 w-7 text-xs"
                        aria-label="Move photo left"
                        title="Move photo earlier"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await reorderRoomImage({
                          roomId: id,
                          mediaId: image.mediaId,
                          direction: "down",
                        });
                      }}
                    >
                      <button
                        type="submit"
                        disabled={index === room.images.length - 1}
                        className="btn-icon h-7 w-7 text-xs"
                        aria-label="Move photo right"
                        title="Move photo later"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>

                  <form
                    action={async () => {
                      "use server";
                      await removeRoomImage({ roomId: id, mediaId: image.mediaId });
                    }}
                  >
                    <button
                      type="submit"
                      className="btn-danger h-7 text-xs px-2 py-0.5"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-black/15 rounded-xl bg-black/2 space-y-1">
            <ImageIcon className="h-8 w-8 text-muted mx-auto" />
            <p className="text-sm font-medium text-text">No photos uploaded for this room</p>
            <p className="text-xs text-muted">Add at least one high quality photo to feature this room on the site.</p>
          </div>
        )}

        {/* Upload Form */}
        <form
          action={handleAddImage}
          encType="multipart/form-data"
          className="border-t border-black/8 pt-4 flex flex-col sm:flex-row sm:items-end gap-3"
        >
          <div className="form-field">
            <label htmlFor="file" className="text-xs font-medium text-text">
              Select Image File
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
              className="text-xs file:btn-secondary file:h-8 file:text-xs file:mr-2 cursor-pointer"
            />
          </div>

          <div className="form-field flex-1">
            <label htmlFor="alt" className="text-xs font-medium text-text">
              Alt Text / Description
            </label>
            <input
              id="alt"
              name="alt"
              placeholder="e.g. Master bedroom with mountain view"
              className="form-input py-1.5 text-xs"
            />
          </div>

          <ActionButton pendingLabel="Uploading photo...">
            <Upload className="h-4 w-4" />
            <span>Upload Photo</span>
          </ActionButton>
        </form>
      </section>

      {/* Section 3: Room Amenities */}
      <section className="card space-y-4">
        <div>
          <h2 className="font-semibold text-lg text-text">Included Amenities</h2>
          <p className="text-xs text-muted">Select all amenities available in this room.</p>
        </div>

        <form action={handleSetAmenities} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {amenities.map((amenity) => {
              const isChecked = selectedAmenityIds.has(amenity.id);
              return (
                <label
                  key={amenity.id}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                    isChecked
                      ? "bg-primary/8 border-primary text-primary"
                      : "bg-background border-black/8 text-text/80 hover:bg-black/3"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="amenityIds"
                    value={amenity.id}
                    defaultChecked={isChecked}
                    className="h-3.5 w-3.5 rounded text-primary focus:ring-accent"
                  />
                  <span className="truncate">{amenity.name}</span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <ActionButton pendingLabel="Saving amenities...">
              <Check className="h-4 w-4" />
              <span>Save Amenities</span>
            </ActionButton>
          </div>
        </form>

        {/* Add New Custom Amenity */}
        <form
          action={handleAddAmenity}
          className="border-t border-black/8 pt-4 flex flex-col sm:flex-row sm:items-end gap-3"
        >
          <div className="form-field flex-1">
            <label htmlFor="amenityName" className="text-xs font-medium text-text">
              Create New Property Amenity
            </label>
            <input
              id="amenityName"
              name="name"
              placeholder="e.g. Heated outdoor spring shower, Mountain tea kit"
              required
              className="form-input py-1.5 text-xs"
            />
          </div>
          <ActionButton variant="secondary" pendingLabel="Adding...">
            <Plus className="h-4 w-4" />
            <span>Add Amenity</span>
          </ActionButton>
        </form>
      </section>
    </div>
  );
}

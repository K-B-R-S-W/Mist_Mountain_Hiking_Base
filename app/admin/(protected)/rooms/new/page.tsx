import { redirect } from "next/navigation";
import Link from "next/link";
import { createRoom } from "@/lib/actions/create-room";
import { ActionButton } from "@/components/admin/ui/action-button";
import { ArrowLeft, Plus, AlertCircle } from "lucide-react";

export default async function NewRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createRoom({
      name: formData.get("name"),
      shortDescription: formData.get("shortDescription"),
      maxGuests: formData.get("maxGuests"),
      basePrice: formData.get("basePrice"),
    });

    if (!result.ok) {
      redirect(`/admin/rooms/new?error=${encodeURIComponent(result.error)}`);
    }
    redirect(`/admin/rooms/${result.data.id}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/rooms"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Rooms</span>
        </Link>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
          Create New Room
        </h1>
        <p className="mt-1 text-sm text-muted">
          New rooms are created as hidden drafts. You can upload photos, select amenities, and publish from the room editor.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="card">
        <form action={handleCreate} className="space-y-4">
          <div className="form-field">
            <label htmlFor="name" className="text-xs font-medium text-text">
              Room Title / Name
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="e.g. Ella Rock Villa Suite"
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="shortDescription" className="text-xs font-medium text-text">
              Short Description (Card Subtitle)
            </label>
            <input
              id="shortDescription"
              name="shortDescription"
              placeholder="e.g. Private balcony overlooking natural springs and organic tea estate"
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <label htmlFor="maxGuests" className="text-xs font-medium text-text">
                Max Guests Capacity
              </label>
              <input
                id="maxGuests"
                name="maxGuests"
                type="number"
                min={1}
                defaultValue={2}
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
                placeholder="25000"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <ActionButton pendingLabel="Creating room draft...">
              <Plus className="h-4 w-4" />
              <span>Create Draft & Continue to Photos</span>
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}

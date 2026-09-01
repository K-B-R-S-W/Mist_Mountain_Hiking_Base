import { redirect } from "next/navigation";
import { createRoom } from "@/lib/actions/create-room";

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
    <div className="max-w-xl">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-primary">New room</h1>
      <p className="mt-2 text-sm text-muted">
        Starts hidden from the public site. Publish it from the edit page once details and photos are ready.
      </p>

      {error ? (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <form action={handleCreate} className="mt-6 space-y-4">
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required className="form-input" />
        </div>
        <div className="form-field">
          <label htmlFor="shortDescription">Short description</label>
          <input id="shortDescription" name="shortDescription" className="form-input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-field">
            <label htmlFor="maxGuests">Max guests</label>
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
            <label htmlFor="basePrice">Base price (LKR)</label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              min={0}
              step="0.01"
              required
              className="form-input"
            />
          </div>
        </div>
        <button type="submit" className="btn-primary">
          Create room
        </button>
      </form>
    </div>
  );
}

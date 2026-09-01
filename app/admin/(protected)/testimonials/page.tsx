import Image from "next/image";
import { updateTestimonial } from "@/lib/actions/update-testimonial";
import { createTestimonial } from "@/lib/actions/create-testimonial";
import { deleteTestimonial } from "@/lib/actions/delete-testimonial";
import { syncGoogleReviews } from "@/lib/actions/sync-google-reviews";
import { getAdminTestimonials, getSiteSettings } from "@/lib/repositories";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function AdminTestimonialsPage() {
  const [testimonials, settings] = await Promise.all([getAdminTestimonials(), getSiteSettings()]);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-primary">Testimonials</h1>
      <p className="mt-2 text-sm text-muted">Moderate approvals and featured guest quotes.</p>

      <section className="card mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg">Google reviews</h2>
            <p className="mt-1 text-sm text-muted">
              {settings.googlePlaceId
                ? "Pulls your current top Google reviews (Google returns at most 5 at a time — this refreshes that set, it doesn't archive full history)."
                : "Set a Google Place ID in Settings → Google Reviews to enable this."}
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await syncGoogleReviews();
            }}
          >
            <button type="submit" className="btn-secondary shrink-0" disabled={!settings.googlePlaceId}>
              Sync Google reviews
            </button>
          </form>
        </div>
      </section>

      <section className="card mt-6">
        <h2 className="text-lg">Add testimonial</h2>
        <form
          action={async (formData) => {
            "use server";
            await createTestimonial(formData);
          }}
          encType="multipart/form-data"
          className="mt-4 grid gap-4 md:grid-cols-2"
        >
          <div className="form-field">
            <label htmlFor="name">Guest name</label>
            <input id="name" name="name" required className="form-input" />
          </div>
          <div className="form-field">
            <label htmlFor="country">Country</label>
            <input id="country" name="country" placeholder="Optional" className="form-input" />
          </div>
          <div className="form-field">
            <label htmlFor="rating">Rating</label>
            <select id="rating" name="rating" defaultValue="5" className="form-input">
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} star{value === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="photo">Guest photo</label>
            <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/avif" />
          </div>
          <div className="form-field md:col-span-2">
            <label htmlFor="quote">Quote</label>
            <textarea id="quote" name="quote" rows={3} required className="form-input resize-y" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input name="isApproved" type="checkbox" defaultChecked />
            Approved (visible on site)
          </label>
          <button type="submit" className="btn-primary md:col-span-2">
            Add testimonial
          </button>
        </form>
      </section>

      <div className="mt-6 space-y-4">
        {testimonials.map((item) => (
          <div key={item.id} className="card flex gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-black/5">
              {item.photoUrl ? (
                <Image src={item.photoUrl} alt={item.name} fill sizes="56px" className="object-cover" />
              ) : null}
            </div>
            <form
              action={async (formData) => {
                "use server";
                await updateTestimonial({
                  id: item.id,
                  isApproved: formData.get("isApproved") === "on",
                  isFeatured: formData.get("isFeatured") === "on",
                });
              }}
              className="flex-1 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {item.name}
                  {item.country ? ` · ${item.country}` : ""}
                  {item.rating ? ` · ${item.rating}★` : ""}
                  <span className="badge ml-2 align-middle">
                    {item.source === "google" ? "Google" : "Manual"}
                  </span>
                </p>
                <p className="text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              {item.reviewUrl ? (
                <a
                  href={item.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-inline text-xs"
                >
                  View on Google
                </a>
              ) : null}
              <p className="text-sm text-muted">&ldquo;{item.quote}&rdquo;</p>
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input name="isApproved" type="checkbox" defaultChecked={item.isApproved} />
                  Approved
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input name="isFeatured" type="checkbox" defaultChecked={item.isFeatured} />
                  Featured
                </label>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
            <form
              action={async () => {
                "use server";
                await deleteTestimonial({ id: item.id });
              }}
            >
              <ConfirmSubmitButton confirmMessage="Delete this testimonial?" className="btn-danger text-xs">
                Delete
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
        {testimonials.length === 0 ? <p className="text-sm text-muted">No testimonials yet.</p> : null}
      </div>
    </div>
  );
}

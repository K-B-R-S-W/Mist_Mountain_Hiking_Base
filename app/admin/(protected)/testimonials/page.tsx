import Image from "next/image";
import { updateTestimonial } from "@/lib/actions/update-testimonial";
import { createTestimonial } from "@/lib/actions/create-testimonial";
import { deleteTestimonial } from "@/lib/actions/delete-testimonial";
import { syncGoogleReviews } from "@/lib/actions/sync-google-reviews";
import { getAdminTestimonials, getSiteSettings } from "@/lib/repositories";
import { ConfirmButton } from "@/components/admin/ui/confirm-dialog";
import { ActionButton } from "@/components/admin/ui/action-button";
import { SourceBadge } from "@/components/admin/ui/status-badge";
import {
  Star,
  RefreshCw,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  MessageSquareQuote,
  CheckCircle2,
} from "lucide-react";

export default async function AdminTestimonialsPage() {
  const [testimonials, settings] = await Promise.all([
    getAdminTestimonials(),
    getSiteSettings(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
          Guest Testimonials & Reviews
        </h1>
        <p className="mt-1 text-sm text-muted">
          Moderate verified guest stories, sync latest Google reviews, and feature top recommendations on the homepage.
        </p>
      </div>

      {/* Google Reviews Sync Card */}
      <section className="card p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-text">Google Place Reviews</span>
              {settings.googlePlaceId ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Place ID Linked
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Setup in Settings
                </span>
              )}
            </div>
            <p className="text-xs text-muted max-w-2xl">
              {settings.googlePlaceId
                ? "Synchronizes your top verified Google reviews into the database. Google returns up to 5 featured reviews per sync."
                : "Enter your business Google Place ID in Settings → Google Integration to enable automated review synchronization."}
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await syncGoogleReviews();
            }}
          >
            <ActionButton
              variant="secondary"
              disabled={!settings.googlePlaceId}
              pendingLabel="Syncing with Google..."
            >
              <RefreshCw className="h-4 w-4 text-accent" />
              <span>Sync Google Reviews</span>
            </ActionButton>
          </form>
        </div>
      </section>

      {/* Add New Testimonial Form */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2 border-b border-black/8 pb-3">
          <Plus className="h-5 w-5 text-accent" />
          <h2 className="font-semibold text-base text-text">Add Direct Guest Quote</h2>
        </div>

        <form
          action={async (formData) => {
            "use server";
            await createTestimonial(formData);
          }}
          encType="multipart/form-data"
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="form-field">
            <label htmlFor="name" className="text-xs font-medium text-text">
              Guest Name
            </label>
            <input id="name" name="name" required placeholder="e.g. Sarah Jenkins" className="form-input text-xs" />
          </div>

          <div className="form-field">
            <label htmlFor="country" className="text-xs font-medium text-text">
              Country / City (Optional)
            </label>
            <input id="country" name="country" placeholder="e.g. United Kingdom" className="form-input text-xs" />
          </div>

          <div className="form-field">
            <label htmlFor="rating" className="text-xs font-medium text-text">
              Star Rating
            </label>
            <select id="rating" name="rating" defaultValue="5" className="form-input text-xs">
              {[5, 4, 3, 2, 1].map((val) => (
                <option key={val} value={val}>
                  {val} Star{val === 1 ? "" : "s"} ({val === 5 ? "Excellent" : `${val}/5`})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="photo" className="text-xs font-medium text-text">
              Guest Photo (Optional)
            </label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="text-xs file:btn-secondary file:h-8 file:text-xs file:mr-2 cursor-pointer"
            />
          </div>

          <div className="form-field sm:col-span-2">
            <label htmlFor="quote" className="text-xs font-medium text-text">
              Guest Review Quote
            </label>
            <textarea
              id="quote"
              name="quote"
              rows={3}
              required
              placeholder="What did the guest say about their stay, the views, natural springs, or hospitality?"
              className="form-input text-xs resize-y"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-black/6">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-text cursor-pointer">
              <input name="isApproved" type="checkbox" defaultChecked className="h-4 w-4 rounded text-primary focus:ring-accent" />
              Approve for immediate public display
            </label>

            <ActionButton pendingLabel="Publishing testimonial...">
              <Plus className="h-4 w-4" />
              <span>Add Testimonial</span>
            </ActionButton>
          </div>
        </form>
      </section>

      {/* Testimonials List */}
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold text-lg text-text">
            All Testimonials ({testimonials.length})
          </h2>
          <p className="text-xs text-muted">
            Toggle approval and homepage featured status for each guest story.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="card text-center py-10 space-y-2">
            <MessageSquareQuote className="h-8 w-8 text-muted mx-auto" />
            <p className="font-medium text-text">No testimonials recorded yet</p>
            <p className="text-xs text-muted">Add a manual quote above or sync from your Google business profile.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((item) => {
              const rating = item.rating || 5;

              return (
                <div
                  key={item.id}
                  className="card flex flex-col sm:flex-row gap-4 p-4 hover:border-black/15 transition-all shadow-xs"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-black/5 border border-black/8 mx-auto sm:mx-0">
                    {item.photoUrl ? (
                      <Image
                        src={item.photoUrl}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-bold text-primary text-base">
                        {item.name.charAt(0)}
                      </div>
                    )}
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/6 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-text">{item.name}</h3>
                          {item.country && (
                            <span className="text-xs text-muted">({item.country})</span>
                          )}
                          <SourceBadge source={item.source} />
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-black/15"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <span className="text-[11px] text-muted">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-text/90 italic bg-black/2 p-3 rounded-lg border border-black/4">
                      &ldquo;{item.quote}&rdquo;
                    </p>

                    {item.reviewUrl && (
                      <a
                        href={item.reviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        <span>View original review on Google</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-xs font-medium text-text">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            name="isApproved"
                            type="checkbox"
                            defaultChecked={item.isApproved}
                            className="h-3.5 w-3.5 rounded text-primary focus:ring-accent"
                          />
                          <span>Approved (Public)</span>
                        </label>

                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            name="isFeatured"
                            type="checkbox"
                            defaultChecked={item.isFeatured}
                            className="h-3.5 w-3.5 rounded text-primary focus:ring-accent"
                          />
                          <span>Featured on Homepage</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <ActionButton pendingLabel="Saving..." className="h-8 text-xs px-3">
                          <Save className="h-3.5 w-3.5" />
                          <span>Save</span>
                        </ActionButton>

                        <ConfirmButton
                          confirmTitle="Delete Testimonial"
                          confirmMessage={`Are you sure you want to delete the testimonial from ${item.name}?`}
                          confirmLabel="Delete"
                          variant="danger"
                          onConfirm={async () => {
                            "use server";
                            await deleteTestimonial({ id: item.id });
                          }}
                          className="btn-danger h-8 text-xs px-2.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </ConfirmButton>
                      </div>
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

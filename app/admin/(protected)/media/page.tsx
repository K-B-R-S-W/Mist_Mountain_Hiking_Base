import Image from "next/image";
import { getAdminMediaFiles } from "@/lib/repositories";
import { uploadMedia } from "@/lib/actions/upload-media";
import { deleteMedia } from "@/lib/actions/delete-media";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

const BUCKETS = ["rooms", "gallery", "hero", "testimonials", "site"] as const;

export default async function AdminMediaPage() {
  const media = await getAdminMediaFiles();

  async function handleUpload(formData: FormData) {
    "use server";
    await uploadMedia(formData);
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-primary">Media library</h1>
      <p className="mt-2 text-sm text-muted">
        Shared asset pool. Room images are uploaded from each room&apos;s edit page; use this for
        general assets (hero, gallery, testimonials, site branding).
      </p>

      <form
        action={handleUpload}
        encType="multipart/form-data"
        className="card mt-6 flex flex-wrap items-end gap-3"
      >
        <div className="form-field">
          <label htmlFor="file">Image</label>
          <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
        </div>
        <div className="form-field">
          <label htmlFor="bucket">Bucket</label>
          <select id="bucket" name="bucket" defaultValue="gallery" className="form-input">
            {BUCKETS.map((bucket) => (
              <option key={bucket} value={bucket}>
                {bucket}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field flex-1">
          <label htmlFor="alt">Alt text</label>
          <input id="alt" name="alt" placeholder="Describe the image" className="form-input" />
        </div>
        <button type="submit" className="btn-primary">
          Upload
        </button>
      </form>

      {media.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="card space-y-2 p-2">
              <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card-inner)] bg-black/5">
                <Image src={item.url} alt={item.alt ?? ""} fill sizes="200px" className="object-cover" />
              </div>
              <p className="truncate text-xs text-muted">{item.bucket}/{item.path}</p>
              <form
                action={async () => {
                  "use server";
                  await deleteMedia({ id: item.id });
                }}
              >
                <ConfirmSubmitButton
                  confirmMessage="Delete this media file? Anything still referencing it will show a broken image."
                  className="btn-danger w-full"
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">No media uploaded yet.</p>
      )}
    </div>
  );
}

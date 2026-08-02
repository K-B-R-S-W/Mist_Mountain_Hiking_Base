import Image from "next/image";
import { updateGalleryImage } from "@/lib/actions/update-gallery-image";
import { createGalleryImage } from "@/lib/actions/create-gallery-image";
import { deleteGalleryImage } from "@/lib/actions/delete-gallery-image";
import { getAdminGalleryImages } from "@/lib/repositories";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function AdminGalleryPage() {
  const images = await getAdminGalleryImages();
  const categories = Object.values(GALLERY_CATEGORIES);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-primary">Gallery</h1>
      <p className="mt-2 text-sm text-muted">Manage visibility and ordering for the public gallery.</p>

      <section className="card mt-6">
        <h2 className="text-lg">Add image</h2>
        <form
          action={async (formData) => {
            "use server";
            await createGalleryImage(formData);
          }}
          encType="multipart/form-data"
          className="mt-4 grid gap-4 md:grid-cols-2"
        >
          <div className="form-field">
            <label htmlFor="file">Image</label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" placeholder="Optional" className="form-input" />
          </div>
          <div className="form-field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue="" className="form-input">
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="alt">Alt text</label>
            <input id="alt" name="alt" placeholder="Describe the image" className="form-input" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input name="isVisible" type="checkbox" defaultChecked />
            Visible on site
          </label>
          <button type="submit" className="btn-primary md:col-span-2">
            Upload
          </button>
        </form>
      </section>

      <div className="mt-6 space-y-4">
        {images.map((image) => (
          <div key={image.id} className="card grid gap-4 md:grid-cols-[120px_1fr]">
            <div className="relative h-24 w-full overflow-hidden rounded-[var(--radius-card-inner)] bg-black/5 md:h-full">
              <Image src={image.url} alt={image.alt ?? ""} fill sizes="120px" className="object-cover" />
            </div>
            <div className="space-y-3">
              <form
                action={async (formData) => {
                  "use server";
                  await updateGalleryImage({
                    id: image.id,
                    title: formData.get("title"),
                    category: formData.get("category"),
                    isVisible: formData.get("isVisible") === "on",
                    featured: formData.get("featured") === "on",
                    sortOrder: formData.get("sortOrder"),
                  });
                }}
                className="grid gap-3 md:grid-cols-6"
              >
                <input name="title" defaultValue={image.title ?? ""} className="form-input md:col-span-2" />
                <select name="category" defaultValue={image.category ?? ""} className="form-input md:col-span-2">
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={image.sortOrder}
                  className="form-input"
                />
                <label className="inline-flex items-center gap-2 text-sm">
                  <input name="isVisible" type="checkbox" defaultChecked={image.isVisible} />
                  Visible
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input name="featured" type="checkbox" defaultChecked={image.featured} />
                  Featured
                </label>
                <button type="submit" className="btn-primary md:col-span-2">
                  Save
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await deleteGalleryImage({ id: image.id });
                }}
              >
                <ConfirmSubmitButton confirmMessage="Remove this image from the gallery?" className="btn-danger text-xs">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {images.length === 0 ? <p className="text-sm text-muted">No gallery images yet.</p> : null}
      </div>
    </div>
  );
}

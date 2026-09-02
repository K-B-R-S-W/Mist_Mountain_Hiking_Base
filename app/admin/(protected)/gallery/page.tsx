import { getAdminGalleryImages } from "@/lib/repositories";
import { GalleryManager } from "@/components/admin/gallery/gallery-manager";

export default async function AdminGalleryPage() {
  const images = await getAdminGalleryImages();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
          Photo Gallery
        </h1>
        <p className="mt-1 text-sm text-muted">
          Organize gallery categories, feature scenic imagery on the homepage, and tell the story of the land.
        </p>
      </div>

      <GalleryManager initialImages={images} />
    </div>
  );
}

import type { Metadata } from "next";
import { getVisibleGalleryImages } from "@/lib/repositories";
import { GalleryMasonry } from "@/components/site/gallery-masonry";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A visual index of rooms, trails, springs, and plantation life around Mist Mountain Hiking Base.",
};

export default async function GalleryPage() {
  const images = await getVisibleGalleryImages();

  return (
    <div className="page-shell py-16">
      <p className="eyebrow">GALLERY</p>
      <h1 className="mt-3 text-3xl md:text-5xl">Mist Mountain moments</h1>
      <p className="mt-4 max-w-2xl text-muted">
        A visual index of rooms, trails, springs, and plantation life around the base.
      </p>
      <GalleryMasonry images={images} />
    </div>
  );
}

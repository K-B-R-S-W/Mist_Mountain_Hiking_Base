"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/lib/types/domain";
import { GALLERY_CATEGORIES } from "@/lib/constants/gallery";
import { updateGalleryImage } from "@/lib/actions/update-gallery-image";
import { createGalleryImage } from "@/lib/actions/create-gallery-image";
import { deleteGalleryImage } from "@/lib/actions/delete-gallery-image";
import { ConfirmButton } from "@/components/admin/ui/confirm-dialog";
import { ActionButton } from "@/components/admin/ui/action-button";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { useToast } from "@/components/admin/ui/toast";
import {
  Upload,
  Save,
  Trash2,
  Images,
  Star,
  Eye,
  EyeOff,
  Filter,
  Plus,
} from "lucide-react";

export function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const toast = useToast();
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showUploadForm, setShowUploadForm] = useState(false);

  const categories = Object.values(GALLERY_CATEGORIES);

  const filteredImages = images.filter((img) => {
    if (categoryFilter === "all") return true;
    return img.category?.toLowerCase() === categoryFilter.toLowerCase();
  });

  const handleUpdate = async (formData: FormData) => {
    try {
      const result = await updateGalleryImage({
        id: formData.get("id") as string,
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        isVisible: formData.get("isVisible") === "on",
        featured: formData.get("featured") === "on",
        sortOrder: formData.get("sortOrder"),
      });

      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Gallery image updated.");
      }
    } catch {
      toast.error("Failed to update image.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteGalleryImage({ id });
      if (!result.ok) {
        toast.error(result.error);
      } else {
        setImages((prev) => prev.filter((img) => img.id !== id));
        toast.success("Image removed from gallery.");
      }
    } catch {
      toast.error("Failed to delete image.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              categoryFilter === "all"
                ? "bg-primary text-background shadow-xs"
                : "text-muted hover:text-text hover:bg-black/4"
            }`}
          >
            All Categories ({images.length})
          </button>
          {categories.map((cat) => {
            const count = images.filter((img) => img.category?.toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-primary text-background shadow-xs"
                    : "text-muted hover:text-text hover:bg-black/4"
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="btn-primary shrink-0 text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>{showUploadForm ? "Hide Upload Form" : "Upload New Image"}</span>
        </button>
      </div>

      {/* Upload Section */}
      {showUploadForm && (
        <section className="card space-y-4 border-accent/30 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-black/8 pb-3">
            <Upload className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-base text-text">Upload Gallery Image</h2>
          </div>

          <form
            action={async (formData) => {
              const res = await createGalleryImage(formData);
              if (res.ok) {
                toast.success("Image uploaded to gallery.");
                setShowUploadForm(false);
              } else {
                toast.error(res.error);
              }
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="form-field">
              <label htmlFor="upload-file" className="text-xs font-medium text-text">
                Select Photo File
              </label>
              <input
                id="upload-file"
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                required
                className="text-xs file:btn-secondary file:h-8 file:text-xs file:mr-2 cursor-pointer"
              />
            </div>

            <div className="form-field">
              <label htmlFor="upload-category" className="text-xs font-medium text-text">
                Category
              </label>
              <select id="upload-category" name="category" defaultValue="" className="form-input text-xs capitalize">
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="upload-title" className="text-xs font-medium text-text">
                Image Title (Optional)
              </label>
              <input id="upload-title" name="title" placeholder="e.g. Natural Spring Bathing Deck" className="form-input text-xs" />
            </div>

            <div className="form-field">
              <label htmlFor="upload-alt" className="text-xs font-medium text-text">
                Alt Description (Accessibility)
              </label>
              <input id="upload-alt" name="alt" placeholder="Describe what is visible in the photo" className="form-input text-xs" />
            </div>

            <div className="form-field sm:col-span-2">
              <label htmlFor="upload-desc" className="text-xs font-medium text-text">
                Story / Experience Description (Optional)
              </label>
              <textarea
                id="upload-desc"
                name="description"
                rows={2}
                placeholder="Shown on /experiences for featured categories like attraction, plantation, springs."
                className="form-input text-xs"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-black/6">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-text cursor-pointer">
                <input name="isVisible" type="checkbox" defaultChecked className="h-4 w-4 rounded text-primary focus:ring-accent" />
                Make immediately visible in public gallery
              </label>
              <ActionButton pendingLabel="Uploading image...">
                <Upload className="h-4 w-4" />
                <span>Upload to Gallery</span>
              </ActionButton>
            </div>
          </form>
        </section>
      )}

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <Images className="h-10 w-10 text-muted mx-auto" />
          <p className="font-medium text-text">No images in this category</p>
          <p className="text-xs text-muted">Upload photos to showcase this experience on the public gallery.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="card flex flex-col gap-4 p-4 hover:border-black/15 transition-all shadow-xs"
            >
              <div className="flex gap-3">
                <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-lg bg-black/5 border border-black/8">
                  <Image
                    src={image.url}
                    alt={image.alt ?? ""}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                  {image.category && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-black/60 text-white backdrop-blur-xs">
                      {image.category}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-sm text-text truncate">
                      {image.title || "Untitled Photo"}
                    </p>
                    <StatusBadge status={image.isVisible ? "visible" : "hidden"} />
                  </div>
                  {image.description && (
                    <p className="text-xs text-muted line-clamp-2">{image.description}</p>
                  )}
                  <p className="text-[10px] text-muted/80">
                    Sort Weight: <span className="font-mono">{image.sortOrder}</span>
                  </p>
                </div>
              </div>

              {/* Edit Details Form */}
              <form action={handleUpdate} className="space-y-3 border-t border-black/6 pt-3 text-xs">
                <input type="hidden" name="id" value={image.id} />

                <div className="grid grid-cols-2 gap-2">
                  <div className="form-field">
                    <label className="text-[10px] uppercase font-semibold text-muted">Title</label>
                    <input
                      name="title"
                      defaultValue={image.title ?? ""}
                      placeholder="Title"
                      className="form-input py-1 text-xs"
                    />
                  </div>

                  <div className="form-field">
                    <label className="text-[10px] uppercase font-semibold text-muted">Category</label>
                    <select
                      name="category"
                      defaultValue={image.category ?? ""}
                      className="form-input py-1 text-xs capitalize"
                    >
                      <option value="">No Category</option>
                      {categories.map((c) => (
                        <option key={c} value={c} className="capitalize">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="form-field col-span-2">
                    <label className="text-[10px] uppercase font-semibold text-muted">Card Story</label>
                    <input
                      name="description"
                      defaultValue={image.description ?? ""}
                      placeholder="Short story for /experiences"
                      className="form-input py-1 text-xs"
                    />
                  </div>

                  <div className="form-field">
                    <label className="text-[10px] uppercase font-semibold text-muted">Order</label>
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={image.sortOrder}
                      className="form-input py-1 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        name="isVisible"
                        type="checkbox"
                        defaultChecked={image.isVisible}
                        className="h-3.5 w-3.5 rounded text-primary focus:ring-accent"
                      />
                      <span>Visible</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        name="featured"
                        type="checkbox"
                        defaultChecked={image.featured}
                        className="h-3.5 w-3.5 rounded text-primary focus:ring-accent"
                      />
                      <span>Featured</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <ConfirmButton
                      confirmTitle="Delete Gallery Image"
                      confirmMessage="Are you sure? This photo will be removed from the public gallery immediately."
                      confirmLabel="Delete"
                      variant="danger"
                      onConfirm={() => handleDelete(image.id)}
                      className="btn-danger h-8 text-xs px-2.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </ConfirmButton>

                    <ActionButton pendingLabel="Saving..." className="h-8 text-xs px-3">
                      <Save className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </ActionButton>
                  </div>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

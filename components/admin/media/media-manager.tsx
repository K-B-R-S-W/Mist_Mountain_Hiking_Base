"use client";

import { useState } from "react";
import Image from "next/image";
import type { MediaFile } from "@/lib/types/domain";
import { uploadMedia } from "@/lib/actions/upload-media";
import { deleteMedia } from "@/lib/actions/delete-media";
import { ConfirmButton } from "@/components/admin/ui/confirm-dialog";
import { ActionButton } from "@/components/admin/ui/action-button";
import { useToast } from "@/components/admin/ui/toast";
import {
  FolderArchive,
  Search,
  Copy,
  Check,
  Trash2,
  Upload,
  Plus,
  ExternalLink,
} from "lucide-react";

const BUCKETS = ["all", "rooms", "gallery", "hero", "testimonials", "site"] as const;

export function MediaManager({
  initialMedia,
  userRole = "admin",
}: {
  initialMedia: MediaFile[];
  userRole?: string;
}) {
  const toast = useToast();
  const [media, setMedia] = useState<MediaFile[]>(initialMedia);
  const [bucketFilter, setBucketFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const filteredMedia = media.filter((item) => {
    const matchesBucket = bucketFilter === "all" || item.bucket.toLowerCase() === bucketFilter.toLowerCase();
    if (!matchesBucket) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.path.toLowerCase().includes(q) ||
      (item.alt && item.alt.toLowerCase().includes(q)) ||
      item.bucket.toLowerCase().includes(q)
    );
  });

  const handleCopyUrl = async (item: MediaFile) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      toast.success("Asset URL copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy URL to clipboard.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteMedia({ id });
      if (!result.ok) {
        toast.error(result.error);
      } else {
        setMedia((prev) => prev.filter((m) => m.id !== id));
        toast.success("Media asset deleted.");
      }
    } catch {
      toast.error("Failed to delete media asset.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="search"
            placeholder="Search assets by file path, name, bucket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowUpload(!showUpload)}
          className="btn-primary shrink-0 text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>{showUpload ? "Hide Upload Form" : "Upload New Asset"}</span>
        </button>
      </div>

      {/* Upload Dropzone */}
      {showUpload && (
        <section className="card space-y-4 border-accent/30 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-black/8 pb-3">
            <Upload className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-base text-text">Upload Asset to Storage</h2>
          </div>

          <form
            action={async (formData) => {
              const res = await uploadMedia(formData);
              if (res.ok) {
                toast.success("Media asset uploaded successfully.");
                setShowUpload(false);
              } else {
                toast.error(res.error);
              }
            }}
            className="grid gap-4 sm:grid-cols-3"
          >
            <div className="form-field sm:col-span-2">
              <label htmlFor="media-file" className="text-xs font-medium text-text">
                Select Photo Asset
              </label>
              <input
                id="media-file"
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                required
                className="text-xs file:btn-secondary file:h-8 file:text-xs file:mr-2 cursor-pointer"
              />
            </div>

            <div className="form-field">
              <label htmlFor="media-bucket" className="text-xs font-medium text-text">
                Storage Bucket
              </label>
              <select id="media-bucket" name="bucket" defaultValue="gallery" className="form-input text-xs">
                {BUCKETS.filter((b) => b !== "all").map((b) => (
                  <option key={b} value={b} className="capitalize">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field sm:col-span-2">
              <label htmlFor="media-alt" className="text-xs font-medium text-text">
                Alt Description / Label
              </label>
              <input
                id="media-alt"
                name="alt"
                placeholder="e.g. Hero spring pool sunrise shot"
                className="form-input text-xs"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end pt-2 border-t border-black/6">
              <ActionButton pendingLabel="Uploading asset to Supabase...">
                <Upload className="h-4 w-4" />
                <span>Upload Media Asset</span>
              </ActionButton>
            </div>
          </form>
        </section>
      )}

      {/* Bucket Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-black/8 pb-3">
        {BUCKETS.map((bucket) => {
          const count =
            bucket === "all"
              ? media.length
              : media.filter((m) => m.bucket.toLowerCase() === bucket.toLowerCase()).length;
          const active = bucketFilter === bucket;

          return (
            <button
              key={bucket}
              type="button"
              onClick={() => setBucketFilter(bucket)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                active
                  ? "bg-primary text-background shadow-xs"
                  : "text-muted hover:text-text hover:bg-black/4"
              }`}
            >
              <span>{bucket === "all" ? "All Buckets" : bucket}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  active ? "bg-accent text-white" : "bg-black/8 text-text"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <FolderArchive className="h-10 w-10 text-muted mx-auto" />
          <p className="font-medium text-text">No media assets found</p>
          <p className="text-xs text-muted">
            {searchQuery
              ? `No files match "${searchQuery}". Try a different keyword.`
              : `No files uploaded to the "${bucketFilter}" bucket yet.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => {
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="group card flex flex-col justify-between p-3 gap-3 hover:border-black/15 transition-all shadow-xs"
              >
                <div className="space-y-2">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black/5 border border-black/8">
                    <Image
                      src={item.url}
                      alt={item.alt ?? item.path}
                      fill
                      sizes="220px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-black/65 text-white backdrop-blur-xs">
                      {item.bucket}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text truncate" title={item.path}>
                      {item.path}
                    </p>
                    <p className="text-[10px] text-muted truncate">
                      {item.alt ? `Alt: ${item.alt}` : new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-black/6">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item)}
                    className={`btn-secondary flex-1 h-8 text-[11px] px-2 gap-1 transition-colors ${
                      isCopied ? "bg-emerald-50 text-emerald-800 border-emerald-300" : ""
                    }`}
                  >
                    {isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{isCopied ? "Copied!" : "Copy URL"}</span>
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon h-8 w-8 text-muted hover:text-text"
                    title="Open full image"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  {userRole === "admin" && (
                    <ConfirmButton
                      confirmTitle="Delete Media Asset"
                      confirmMessage="Are you sure? This file will be permanently deleted from Supabase Storage and removed from any pages using it."
                      confirmLabel="Delete"
                      variant="danger"
                      onConfirm={() => handleDelete(item.id)}
                      className="btn-danger h-8 px-2 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </ConfirmButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

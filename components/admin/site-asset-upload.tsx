"use client";

import { useActionState, useRef } from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { setSiteAsset, removeSiteAsset } from "@/lib/actions/site-assets";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import type { ActionResult } from "@/lib/actions/with-admin-action";

type SiteAssetType = "logo" | "favicon" | "hero" | "mist_experience" | "experiences";
type UploadResult = ActionResult<{ url: string }>;

/**
 * One upload/replace/remove control for a single site_assets slot.
 * Shared by Branding (logo, favicon — square preview) and Homepage
 * Imagery (hero, Mist Experience, Experiences — wide preview).
 *
 * The whole preview tile IS the control: click it, pick a file, it
 * submits itself immediately (no separate "Upload" button to lose
 * track of in a narrow column — that's what was making Hero's button
 * disappear off-layout). Pending/error state comes from useActionState
 * so a failed upload shows a real message instead of silently doing
 * nothing.
 */
export function SiteAssetUpload({
  type,
  label,
  currentUrl,
  currentAlt,
  removeConfirmMessage,
  aspect = "square",
}: {
  type: SiteAssetType;
  label: string;
  currentUrl: string | null;
  currentAlt?: string | null;
  removeConfirmMessage: string;
  aspect?: "square" | "wide";
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<UploadResult | null, FormData>(
    async (_prevState, formData) => {
      formData.set("type", type);
      return setSiteAsset(formData);
    },
    null
  );

  // Optimistic local preview so the tile updates the instant a file is
  // picked, instead of staying blank until the server round-trip resolves.
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);
  useEffect(() => {
    // Once the real upload resolves (revalidatePath brings a fresh
    // currentUrl prop on next render), drop the temporary blob preview.
    if (state?.ok && localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const displayUrl = localPreview ?? currentUrl;
  const boxClass =
    aspect === "wide"
      ? "relative flex h-36 w-full sm:h-40 rounded-[var(--radius-card-inner)]"
      : "relative flex h-24 w-24 rounded-[var(--radius-card-inner)]";

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>

      <form ref={formRef} action={formAction} className="mt-2">
        <label
          className={`${boxClass} group cursor-pointer overflow-hidden border border-dashed border-black/15 bg-black/5 transition hover:border-accent focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent`}
        >
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            disabled={isPending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setLocalPreview(URL.createObjectURL(file));
              formRef.current?.requestSubmit();
            }}
          />
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={currentAlt ?? label}
              fill
              sizes="240px"
              className={`object-cover transition ${isPending ? "opacity-50" : ""}`}
              unoptimized={Boolean(localPreview)}
            />
          ) : null}
          <span
            className={`pointer-events-none absolute inset-0 flex items-center justify-center text-center text-xs font-medium ${
              displayUrl
                ? "bg-black/0 text-transparent opacity-0 transition group-hover:bg-black/45 group-hover:text-white group-hover:opacity-100"
                : "text-muted"
            }`}
          >
            {isPending ? "Uploading…" : displayUrl ? "Click to replace" : "Click to upload"}
          </span>
        </label>
      </form>

      {currentUrl ? (
        <form
          action={async () => {
            await removeSiteAsset(type);
          }}
          className="mt-2"
        >
          <ConfirmSubmitButton confirmMessage={removeConfirmMessage} className="text-xs text-red-600 underline">
            Remove
          </ConfirmSubmitButton>
        </form>
      ) : null}

      {state && !state.ok ? (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
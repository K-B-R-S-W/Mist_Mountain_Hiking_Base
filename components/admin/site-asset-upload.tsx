"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import Image from "next/image";
import { setSiteAsset, removeSiteAsset } from "@/lib/actions/site-assets";
import { ConfirmButton } from "@/components/admin/ui/confirm-dialog";
import type { ActionResult } from "@/lib/actions/with-admin-action";
import { UploadCloud, Trash2, CheckCircle2 } from "lucide-react";

type SiteAssetType = "logo" | "favicon" | "hero" | "mist_experience" | "experiences";
type UploadResult = ActionResult<{ url: string }>;

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

  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    if (state && localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
  }, [state, localPreview]);

  const displayUrl = localPreview ?? currentUrl;
  const boxClass =
    aspect === "wide"
      ? "relative flex h-36 w-full sm:h-44 rounded-xl"
      : "relative flex h-28 w-28 rounded-xl";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        {displayUrl && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Configured
          </span>
        )}
      </div>

      <form ref={formRef} action={formAction}>
        <label
          className={`${boxClass} group cursor-pointer overflow-hidden border-2 border-dashed border-black/15 bg-black/3 transition hover:border-accent hover:bg-black/5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent shadow-xs`}
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
              className={`object-cover transition ${isPending ? "opacity-40" : ""}`}
              unoptimized={Boolean(localPreview)}
            />
          ) : null}
          <span
            className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-xs font-medium gap-1.5 ${
              displayUrl
                ? "bg-black/0 text-transparent opacity-0 transition group-hover:bg-black/55 group-hover:text-white group-hover:opacity-100"
                : "text-muted"
            }`}
          >
            <UploadCloud className="h-5 w-5 opacity-70" />
            <span>{isPending ? "Uploading..." : displayUrl ? "Click to Replace" : "Click to Upload"}</span>
          </span>
        </label>
      </form>

      {currentUrl && (
        <div className="flex justify-end pt-1">
          <ConfirmButton
            confirmTitle={`Remove ${label}?`}
            confirmMessage={removeConfirmMessage}
            confirmLabel="Remove Asset"
            variant="danger"
            onConfirm={async () => {
              await removeSiteAsset(type);
            }}
            className="btn-danger h-7 text-[11px] px-2 gap-1"
          >
            <Trash2 className="h-3 w-3" />
            <span>Remove</span>
          </ConfirmButton>
        </div>
      )}

      {state && !state.ok && (
        <p role="alert" className="text-xs text-rose-600 font-medium">
          {state.error}
        </p>
      )}
    </div>
  );
}
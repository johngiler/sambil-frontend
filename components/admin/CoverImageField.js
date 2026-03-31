"use client";

import { adminLabel } from "@/components/admin/adminFormStyles";
import { mediaAbsoluteUrl } from "@/services/authApi";

const VARIANT_DEFAULTS = {
  cover: {
    label: "Imagen de portada",
    clearLabel: "Quitar portada actual",
    emptyHint: "Sin imagen",
    helper: "JPG, PNG, WebP o GIF. Recomendado imagen cuadrada (p. ej. 1200×1200 px).",
    imgClass: "h-full w-full object-cover",
    wrapClass:
      "aspect-square w-full max-w-md overflow-hidden rounded-[10px] border border-zinc-200 bg-zinc-50",
  },
  avatar: {
    label: "Foto de perfil",
    clearLabel: "Quitar foto actual",
    emptyHint: "Sin foto",
    helper: "JPG, PNG, WebP o GIF. Recomendado imagen cuadrada (p. ej. 512×512 px).",
    imgClass: "h-36 w-36 object-cover",
    wrapClass:
      "mx-auto flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50",
  },
};

export function CoverImageField({
  readOnly,
  variant = "cover",
  label,
  existingUrl,
  filePreviewUrl,
  onFileChange,
  onClearExisting,
  fileInputRef,
}) {
  const v = VARIANT_DEFAULTS[variant] ?? VARIANT_DEFAULTS.cover;
  const resolvedLabel = label ?? v.label;
  const showUrl = filePreviewUrl || (existingUrl ? mediaAbsoluteUrl(existingUrl) : "");

  return (
    <div>
      <p className={adminLabel}>{resolvedLabel}</p>
      {showUrl ? (
        <div className={`mt-2 ${v.wrapClass}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={showUrl} alt="" className={v.imgClass} />
        </div>
      ) : (
        <p className="mt-2 rounded-[10px] border border-dashed border-zinc-200 bg-zinc-50/80 py-8 text-center text-xs text-zinc-500">
          {v.emptyHint}
        </p>
      )}
      {!readOnly ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="cursor-pointer rounded-[10px] border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50">
            Elegir archivo
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                onFileChange?.(f ?? null);
              }}
            />
          </label>
          {existingUrl && !filePreviewUrl ? (
            <button
              type="button"
              className="text-xs font-medium text-red-600 hover:underline"
              onClick={onClearExisting}
            >
              {v.clearLabel}
            </button>
          ) : null}
        </div>
      ) : null}
      {!readOnly ? <p className="mt-1 text-xs text-zinc-500">{v.helper}</p> : null}
    </div>
  );
}

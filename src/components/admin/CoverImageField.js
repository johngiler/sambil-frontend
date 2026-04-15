"use client";

import { useCallback, useRef, useState } from "react";

import { adminLabel } from "@/components/admin/adminFormStyles";
import { catalogRasterImgAttrs } from "@/lib/catalogImageProps";
import { IconRowTrash } from "@/components/admin/rowActionIcons";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { mediaAbsoluteUrl } from "@/services/authApi";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

function UploadIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3M17 8l-5-5-5 5M12 3v12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function validateImageFile(file) {
  if (!file) return "Archivo no válido.";
  if (file.size > MAX_BYTES) return "La imagen no puede superar 10 MB.";
  const okType =
    (file.type && ACCEPT.split(",").some((t) => t.trim() === file.type)) ||
    /\.(jpe?g|png|webp|gif)$/i.test(file.name);
  if (!okType) return "Usa JPG, PNG, WebP o GIF.";
  return "";
}

const VARIANT_DEFAULTS = {
  cover: {
    label: "Imagen de portada",
    clearAriaLabel: "Quitar portada actual",
    clearSelectionAriaLabel: "Quitar archivo seleccionado",
    emptyHint: "Sin imagen",
    helper: "Una sola imagen. JPG, PNG, WebP o GIF · máx. 10 MB. Recomendado cuadrado (p. ej. 1200×1200 px).",
    imgClass: "h-full w-full object-cover",
    wrapClass:
      "aspect-square w-full max-w-md overflow-hidden rounded-[10px] border border-zinc-200 bg-zinc-50",
  },
  avatar: {
    label: "Foto de perfil",
    clearAriaLabel: "Quitar foto actual",
    clearSelectionAriaLabel: "Quitar archivo seleccionado",
    emptyHint: "Sin foto",
    helper: "Una sola imagen. JPG, PNG, WebP o GIF · máx. 10 MB. Recomendado cuadrado (p. ej. 512×512 px).",
    imgClass: "h-36 w-36 object-cover",
    wrapClass:
      "mx-auto flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50",
  },
};

/**
 * Portada o foto (avatar): una imagen, elegir archivo y/o arrastrar y soltar (estilo tomas, sin múltiples).
 */
export function CoverImageField({
  readOnly,
  variant = "cover",
  label,
  existingUrl,
  filePreviewUrl,
  onFileChange,
  onClearExisting,
  fileInputRef,
  /** Si es false, solo botón «Elegir archivo» (sin zona de drop). */
  enableDropZone = true,
}) {
  const v = VARIANT_DEFAULTS[variant] ?? VARIANT_DEFAULTS.cover;
  const resolvedLabel = label ?? v.label;
  const showUrl = filePreviewUrl || (existingUrl ? mediaAbsoluteUrl(existingUrl) : "");
  const [zoneDrag, setZoneDrag] = useState(false);
  const [err, setErr] = useState("");
  const fallbackInputRef = useRef(null);
  const inputRef = fileInputRef ?? fallbackInputRef;

  const applyFile = useCallback(
    (file) => {
      setErr("");
      if (!file) {
        onFileChange?.(null);
        return;
      }
      const msg = validateImageFile(file);
      if (msg) {
        setErr(msg);
        return;
      }
      onFileChange?.(file);
    },
    [onFileChange],
  );

  const onDropZone = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setZoneDrag(false);
      if (readOnly) return;
      const f = e.dataTransfer.files?.[0];
      if (f) applyFile(f);
      if (inputRef.current) inputRef.current.value = "";
    },
    [readOnly, applyFile, inputRef],
  );

  const onDragLeaveZone = useCallback((e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setZoneDrag(false);
  }, []);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);

  if (readOnly) {
    return (
      <div>
        <p className={adminLabel}>{resolvedLabel}</p>
        {showUrl ? (
          <div className={`mt-2 ${v.wrapClass}`}>
            <img
              src={showUrl}
              alt=""
              className={v.imgClass}
              {...(variant === "avatar" ? { width: 144, height: 144 } : {})}
              {...catalogRasterImgAttrs}
            />
          </div>
        ) : (
          <p className="mt-2 rounded-[10px] border border-dashed border-zinc-200 bg-zinc-50/80 py-8 text-center text-xs text-zinc-500">
            {v.emptyHint}
          </p>
        )}
      </div>
    );
  }

  if (!enableDropZone) {
    return (
      <div>
        <p className={adminLabel}>{resolvedLabel}</p>
        {showUrl ? (
          <div className={`mt-2 ${v.wrapClass}`}>
            <img
              src={showUrl}
              alt=""
              className={v.imgClass}
              {...(variant === "avatar" ? { width: 144, height: 144 } : {})}
              {...catalogRasterImgAttrs}
            />
          </div>
        ) : (
          <p className="mt-2 rounded-[10px] border border-dashed border-zinc-200 bg-zinc-50/80 py-8 text-center text-xs text-zinc-500">
            {v.emptyHint}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="cursor-pointer rounded-[10px] border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50">
            Elegir archivo
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                applyFile(f ?? null);
                e.target.value = "";
              }}
            />
          </label>
          {existingUrl && !filePreviewUrl ? (
            <button
              type="button"
              className="mp-ring-brand inline-flex shrink-0 items-center justify-center rounded-[15px] border border-transparent p-2 text-red-600 transition-colors hover:border-red-200/90 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_35%,transparent)]"
              aria-label={v.clearAriaLabel}
              onClick={onClearExisting}
            >
              <IconRowTrash />
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-zinc-500">{v.helper}</p>
      </div>
    );
  }

  const hasImage = Boolean(showUrl);
  const dropCompact = hasImage;

  return (
    <div>
      <p className={adminLabel}>{resolvedLabel}</p>
      <p className="mt-1 text-xs text-zinc-500">{v.helper}</p>

      {err ? (
        <p className={`mt-2 ${ROUNDED_CONTROL} bg-red-50 px-3 py-2 text-xs text-red-800`} role="alert">
          {err}
        </p>
      ) : null}

      {hasImage ? (
        <div className="mt-3">
          <div className={v.wrapClass}>
            <img
              src={showUrl}
              alt=""
              className={v.imgClass}
              {...(variant === "avatar" ? { width: 144, height: 144 } : {})}
              {...catalogRasterImgAttrs}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {existingUrl && !filePreviewUrl ? (
              <button
                type="button"
                className="mp-ring-brand inline-flex shrink-0 items-center justify-center rounded-[15px] border border-transparent p-2 text-red-600 transition-colors hover:border-red-200/90 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_35%,transparent)]"
                aria-label={v.clearAriaLabel}
                onClick={() => {
                  setErr("");
                  onClearExisting?.();
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                <IconRowTrash />
              </button>
            ) : null}
            {filePreviewUrl ? (
              <button
                type="button"
                className="rounded-[10px] border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                aria-label={v.clearSelectionAriaLabel}
                onClick={() => {
                  setErr("");
                  applyFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                Quitar selección
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setZoneDrag(true);
        }}
        onDragLeave={onDragLeaveZone}
        onDrop={onDropZone}
        className={`mt-3 flex w-full flex-col items-center justify-center border-2 border-dashed px-4 transition-colors rounded-[10px] ${
          dropCompact ? "py-6" : "min-h-[200px] py-10"
        } ${
          zoneDrag
            ? "border-[color-mix(in_srgb,var(--mp-primary)_55%,#a1a1aa)] bg-[color-mix(in_srgb,var(--mp-primary)_8%,#fff)]"
            : "border-zinc-200 bg-zinc-50/80 hover:border-zinc-300"
        }`}
      >
        <div className="flex max-w-md flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-zinc-600 shadow-sm ring-1 ring-zinc-200">
            <UploadIcon className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-zinc-800">
            {hasImage ? (
              <>
                Reemplazar: arrastra aquí o{" "}
                <button
                  type="button"
                  className="mp-text-brand no-underline underline-offset-2 transition-colors hover:underline hover:decoration-[color-mix(in_srgb,var(--mp-primary)_85%,transparent)]"
                  onClick={openPicker}
                >
                  elige un archivo
                </button>
              </>
            ) : (
              <>
                Arrastra una imagen aquí o{" "}
                <button
                  type="button"
                  className="mp-text-brand no-underline underline-offset-2 transition-colors hover:underline hover:decoration-[color-mix(in_srgb,var(--mp-primary)_85%,transparent)]"
                  onClick={openPicker}
                >
                  elige un archivo
                </button>
              </>
            )}
          </p>
          <p className="text-xs text-zinc-500">Solo una imagen · máx. 10 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            applyFile(f ?? null);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

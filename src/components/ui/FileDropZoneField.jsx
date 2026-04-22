"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { catalogRasterImgAttrs } from "@/lib/catalogImageProps";
import { squareListImagePreviewFrameClass } from "@/lib/squareImagePreview";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

const labelClass =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400";

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** @param {File} file */
function fileIsImage(file) {
  if (file.type && file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

/** @param {File} file */
function fileIsPdf(file) {
  if (file.type === "application/pdf") return true;
  return /\.pdf$/i.test(file.name);
}

/** @param {File} file @param {string} accept */
function fileMatchesAccept(file, accept) {
  const tokens = accept
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  for (const t of tokens) {
    if (t.startsWith(".")) {
      if (file.name.toLowerCase().endsWith(t.toLowerCase())) return true;
    } else if (t.endsWith("/*")) {
      const prefix = t.slice(0, -1);
      if (file.type && file.type.startsWith(prefix)) return true;
    } else if (file.type === t) {
      return true;
    }
  }
  return false;
}

function UploadIcon({ className }) {
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

function FileStackIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 12h6m-6 4h4M9 8h6m2-2.5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h5l3 3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Zona de arrastrar y soltar + selector de archivo, con vista previa opcional.
 * @param {{
 *   id: string;
 *   label?: string;
 *   value: File | null;
 *   onChange: (file: File | null) => void;
 *   accept?: string;
 *   helperText?: string;
 *   maxBytes?: number;
 *   maxBytesErrorMessage?: string;
 *   formatErrorMessage?: string;
 *   formatsHint?: string;
 *   showInlinePreview?: boolean;
 *   dropZoneAriaLabel?: string;
 *   className?: string;
 *   showLabel?: boolean;
 *   ariaLabel?: string;
 * }} props
 * ariaLabel: si showLabel es false, texto accesible del input de archivo.
 */
export function FileDropZoneField({
  id,
  label = "Archivo",
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  helperText = "",
  maxBytes = DEFAULT_MAX_BYTES,
  maxBytesErrorMessage = "El archivo no puede superar 5 MB. Elige otro archivo.",
  formatErrorMessage = "Formato no permitido. Revisa los tipos aceptados.",
  formatsHint = "JPG, PNG, WebP o PDF · máximo 5 MB",
  showInlinePreview = true,
  dropZoneAriaLabel = "Zona para adjuntar archivo",
  className = "",
  showLabel = true,
  ariaLabel,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(/** @type {string | null} */ (null));
  const helperId = useId();
  const errorId = useId();

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const assignFile = useCallback(
    (file) => {
      if (!file) {
        setSizeError("");
        onChange(null);
        return;
      }
      if (!fileMatchesAccept(file, accept)) {
        setSizeError(formatErrorMessage);
        return;
      }
      if (file.size > maxBytes) {
        setSizeError(maxBytesErrorMessage);
        return;
      }
      setSizeError("");
      onChange(file);
    },
    [accept, formatErrorMessage, maxBytes, maxBytesErrorMessage, onChange],
  );

  const clear = useCallback(() => {
    if (inputRef.current) inputRef.current.value = "";
    setSizeError("");
    onChange(null);
  }, [onChange]);

  const onInputChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    assignFile(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    assignFile(f);
  };

  const openPicker = () => inputRef.current?.click();

  const zoneBase = `${ROUNDED_CONTROL} border-2 border-dashed transition-[border-color,background-color,box-shadow] duration-200 ease-out`;
  const zoneIdle =
    "border-zinc-200 bg-zinc-50/60 hover:border-[color-mix(in_srgb,var(--mp-primary)_35%,#d4d4d8)] hover:bg-[color-mix(in_srgb,var(--mp-primary)_6%,#fafafa)]";
  const zoneDrag =
    "border-[color-mix(in_srgb,var(--mp-primary)_55%,#a1a1aa)] bg-[color-mix(in_srgb,var(--mp-primary)_10%,#fff)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--mp-primary)_18%,transparent)]";
  const zoneFile = "border-[color-mix(in_srgb,var(--mp-primary)_28%,#e4e4e7)] bg-white";

  const rootClass = [className.trim(), "space-y-2"].filter(Boolean).join(" ");

  const inputAriaLabel = showLabel ? undefined : ariaLabel ?? label;

  return (
    <div className={rootClass}>
      {showLabel ? (
        <label className={labelClass} htmlFor={id}>
          {label}
        </label>
      ) : null}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={onInputChange}
        aria-label={inputAriaLabel}
        aria-describedby={[helperText ? helperId : null, sizeError ? errorId : null].filter(Boolean).join(" ") || undefined}
      />

      <div
        role="region"
        aria-label={dropZoneAriaLabel}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`${zoneBase} ${value ? zoneFile : isDragging ? zoneDrag : zoneIdle} p-4 sm:p-5`}
      >
        {!value ? (
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left sm:gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center ${ROUNDED_CONTROL} bg-[color-mix(in_srgb,var(--mp-primary)_14%,#fff)] mp-text-brand`}
            >
              <UploadIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold text-zinc-900">
                Arrastra el archivo aquí o{" "}
                <button
                  type="button"
                  onClick={openPicker}
                  className="mp-text-brand no-underline underline-offset-2 transition-colors hover:underline hover:decoration-[color-mix(in_srgb,var(--mp-primary)_80%,transparent)]"
                >
                  elige un archivo
                </button>
              </p>
              <p className="text-xs text-zinc-500">{formatsHint}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {showInlinePreview && previewUrl && fileIsImage(value) ? (
              <div className={`${squareListImagePreviewFrameClass} bg-zinc-100/80 shadow-inner`}>
                <img
                  src={previewUrl}
                  alt={`Vista previa: ${value.name}`}
                  width={100}
                  height={100}
                  className="h-full w-full object-contain p-1"
                  {...catalogRasterImgAttrs}
                />
              </div>
            ) : null}
            {showInlinePreview && previewUrl && fileIsPdf(value) ? (
              <div className={`space-y-2 ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50`}>
                <div className="relative min-h-[200px] w-full overflow-hidden sm:min-h-[240px]">
                  <iframe
                    title={`Vista previa del PDF: ${value.name}`}
                    src={previewUrl}
                    className="absolute inset-0 h-full w-full border-0 bg-white"
                  />
                </div>
                <p className="px-3 pb-2 text-center text-[11px] text-zinc-500">
                  Si no ves el documento,{" "}
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mp-text-brand font-semibold no-underline underline-offset-2 transition-colors hover:underline hover:decoration-[color-mix(in_srgb,var(--mp-primary)_80%,transparent)]"
                  >
                    ábrelo en una nueva pestaña
                  </a>
                  .
                </p>
              </div>
            ) : null}
            {showInlinePreview && previewUrl && !fileIsImage(value) && !fileIsPdf(value) ? (
              <div
                className={`flex items-center gap-3 ${ROUNDED_CONTROL} border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-4`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center ${ROUNDED_CONTROL} bg-[color-mix(in_srgb,var(--mp-primary)_12%,#fff)] mp-text-brand`}
                >
                  <FileStackIcon className="h-5 w-5" />
                </div>
                <p className="text-xs text-zinc-600">
                  No hay vista previa para este tipo de archivo. Puedes{" "}
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mp-text-brand font-semibold no-underline underline-offset-2 transition-colors hover:underline hover:decoration-[color-mix(in_srgb,var(--mp-primary)_80%,transparent)]"
                  >
                    abrirlo en una nueva pestaña
                  </a>{" "}
                  para comprobarlo.
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-start gap-3 sm:items-center">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center ${ROUNDED_CONTROL} bg-[color-mix(in_srgb,var(--mp-primary)_12%,#fff)] mp-text-brand sm:hidden`}
                  aria-hidden
                >
                  <FileStackIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 sm:pl-0">
                  <p className="truncate text-sm font-semibold text-zinc-900" title={value.name}>
                    {value.name}
                  </p>
                  <p className="text-xs text-zinc-500">{formatFileSize(value.size)}</p>
                  {showInlinePreview && previewUrl && fileIsImage(value) ? (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs font-semibold mp-text-brand no-underline underline-offset-2 transition-colors hover:underline hover:decoration-[color-mix(in_srgb,var(--mp-primary)_80%,transparent)]"
                    >
                      Ampliar en nueva pestaña
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={openPicker}
                  className={`${ROUNDED_CONTROL} border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50`}
                >
                  Cambiar archivo
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className={`${ROUNDED_CONTROL} border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 transition-colors hover:bg-red-100`}
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {sizeError ? (
        <p id={errorId} className={`text-xs font-medium text-red-700 ${ROUNDED_CONTROL} bg-red-50 px-3 py-2`} role="alert">
          {sizeError}
        </p>
      ) : null}

      {helperText ? (
        <p id={helperId} className="text-xs leading-relaxed text-zinc-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

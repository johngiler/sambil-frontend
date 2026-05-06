import React from "react";

function CameraGlyph({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7a2 2 0 0 1 2-2h2l1-1h6l1 1h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
      <path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    </svg>
  );
}

function UserGlyph({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21a8 8 0 1 0-16 0" />
      <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    </svg>
  );
}

/**
 * Placeholder para miniaturas cuadradas cuando no hay imagen.
 * Úsalo dentro de un frame tipo `squareAdminTablePortadaFrameClass`, etc.
 */
export function ThumbnailPlaceholder({
  label = "Sin imagen",
  showLabel = false,
  variant = "image",
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-zinc-500">
      {variant === "avatar" ? (
        <UserGlyph className="h-6 w-6" />
      ) : (
        <CameraGlyph className="h-6 w-6" />
      )}
      {showLabel ? (
        <span className="px-1 text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      ) : null}
    </div>
  );
}


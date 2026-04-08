"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { ImageLightbox } from "@/components/media/ImageLightbox";

/**
 * Portada(s) del detalle de toma en marketplace: clic abre {@link ImageLightbox}.
 * @param {{ galleryUrls: string[]; coverAlt: string; figureClassName?: string; imageSizes?: string }} props
 */
export function SpaceDetailCoverWithLightbox({
  galleryUrls,
  coverAlt,
  figureClassName = "mt-8",
  imageSizes = "(max-width: 1024px) 100vw, min(560px, 45vw)",
}) {
  const [open, setOpen] = useState(false);
  const urls = useMemo(
    () => (Array.isArray(galleryUrls) ? galleryUrls.filter((u) => u && String(u).trim()) : []),
    [galleryUrls],
  );
  const hero = urls[0];
  if (!hero) return null;

  const lightboxItems = urls.map((src, i) => ({
    src,
    alt: urls.length > 1 ? `${coverAlt} (${i + 1}/${urls.length})` : coverAlt,
    thumbnailSrc: src,
  }));

  return (
    <>
      <figure className={figureClassName}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block w-full overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-100 text-left shadow-sm ring-1 ring-zinc-200/60 transition hover:ring-[color-mix(in_srgb,var(--mp-primary)_35%,#d4d4d8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_45%,transparent)]"
          aria-label={urls.length > 1 ? "Abrir galería de imágenes" : "Abrir imagen ampliada"}
        >
          <div className="relative aspect-square w-full">
            <Image
              src={hero}
              alt={coverAlt}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes={imageSizes}
              priority
            />
          </div>
          {urls.length > 1 ? (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              +{urls.length - 1} foto{urls.length - 1 === 1 ? "" : "s"}
            </span>
          ) : null}
        </button>
      </figure>
      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        items={lightboxItems}
        showDownload={false}
        showThumbnails={urls.length > 1}
        ariaLabel="Imágenes del espacio publicitario"
      />
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

import { SpaceDetailFavoriteButton } from "@/components/catalog/SpaceDetailFavoriteButton";
import { CatalogRasterImage } from "@/components/media/CatalogRasterImage";
import { ImageLightbox } from "@/components/media/ImageLightbox";

/**
 * Cuenta cuántas URLs de galería responden como imagen (misma heurística que el navegador al pintar).
 * Evita mostrar "+N fotos" según el API si parte de las URLs están rotas o devuelven error.
 */
function useGalleryUrlsThatLoad(urls) {
  const key = useMemo(() => urls.join("\u0001"), [urls]);
  const [validUrls, setValidUrls] = useState(null);

  useEffect(() => {
    if (urls.length === 0) {
      setValidUrls([]);
      return;
    }
    if (urls.length === 1) {
      setValidUrls(urls);
      return;
    }

    setValidUrls(null);
    let cancelled = false;
    const n = urls.length;
    let done = 0;
    const loadedOk = Array(n).fill(false);

    const finishOne = (i, ok) => {
      if (cancelled) return;
      loadedOk[i] = ok;
      done += 1;
      if (done < n) return;
      const next = urls.filter((_, j) => loadedOk[j]);
      setValidUrls(next.length > 0 ? next : urls);
    };

    urls.forEach((src, i) => {
      const im = new window.Image();
      im.onload = () => finishOne(i, true);
      im.onerror = () => finishOne(i, false);
      im.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return validUrls;
}

/**
 * Portada(s) del detalle de toma en marketplace: clic abre {@link ImageLightbox}.
 * @param {{ galleryUrls: string[]; coverAlt: string; figureClassName?: string; imageSizes?: string; spaceId?: number|string }} props
 */
export function SpaceDetailCoverWithLightbox({
  galleryUrls,
  coverAlt,
  figureClassName = "mt-8",
  imageSizes = "(max-width: 1024px) 100vw, min(560px, 45vw)",
  spaceId,
}) {
  const [open, setOpen] = useState(false);
  const urls = useMemo(
    () =>
      Array.isArray(galleryUrls)
        ? galleryUrls.filter((u) => u && String(u).trim())
        : [],
    [galleryUrls],
  );
  const validUrls = useGalleryUrlsThatLoad(urls);
  const displayUrls = validUrls ?? urls;
  const hasCover = displayUrls.length > 0;

  const n = displayUrls.length;
  const lightboxItems = hasCover
    ? displayUrls.map((src, i) => ({
        src,
        alt: n > 1 ? `${coverAlt} (${i + 1}/${n})` : coverAlt,
        thumbnailSrc: src,
      }))
    : [];

  const extraCount = n > 1 ? n - 1 : 0;
  const showExtraBadge = hasCover && validUrls !== null && extraCount > 0;

  const openLabel = n > 1 ? "Abrir galería de imágenes" : "Abrir imagen ampliada";

  return (
    <>
      <figure className={figureClassName}>
        <div className="group relative w-full overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-100 text-left shadow-sm ring-1 ring-zinc-200/60 transition hover:ring-[color-mix(in_srgb,var(--mp-primary)_35%,#d4d4d8)]">
          {hasCover ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="absolute inset-0 z-0 cursor-zoom-in rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_45%,transparent)]"
              aria-label={openLabel}
            />
          ) : null}
          <div className="pointer-events-none relative aspect-square w-full">
            <CatalogRasterImage
              candidates={displayUrls}
              alt={coverAlt}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes={imageSizes}
              priority
              fetchPriority="high"
              decoding="async"
            />
          </div>
          {spaceId != null && spaceId !== "" ? (
            <SpaceDetailFavoriteButton spaceId={spaceId} variant="overlay" />
          ) : null}
          {showExtraBadge ? (
            <span className="pointer-events-none absolute bottom-3 right-3 z-[1] rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              +{extraCount} foto{extraCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </figure>
      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        items={lightboxItems}
        showDownload={false}
        showThumbnails={n > 1}
        ariaLabel="Imágenes del espacio publicitario"
      />
    </>
  );
}

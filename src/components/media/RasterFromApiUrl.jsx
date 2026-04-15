"use client";

import { useMemo } from "react";

import { rasterDisplayCandidates } from "@/lib/mediaUrls";

import { CatalogRasterImage } from "./CatalogRasterImage";

/**
 * Miniatura / portada desde campo del API: primera petición `.webp` si existe en ruta, fallback al raster original.
 */
export function RasterFromApiUrl({ url, alt = "", className = "", priority = false, ...rest }) {
  const candidates = useMemo(() => rasterDisplayCandidates(url), [url]);
  if (candidates.length === 0) return null;
  return (
    <CatalogRasterImage
      candidates={candidates}
      alt={alt}
      className={className}
      priority={priority}
      {...rest}
    />
  );
}

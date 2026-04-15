"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { rasterUrlTryWebpVariant } from "@/lib/rasterImageWebpFallback";

/**
 * `next/image` para portadas del catálogo: si la URL raster (.jpg/.png/…) falla (p. ej. BD aún con extensión
 * antigua tras migración a WebP en el servidor), reintenta una vez con la variante `.webp`.
 */
export function CatalogRasterImage({ src, onError: onErrorProp, ...rest }) {
  const [effectiveSrc, setEffectiveSrc] = useState(src);
  const triedWebpRef = useRef(false);

  useEffect(() => {
    setEffectiveSrc(src);
    triedWebpRef.current = false;
  }, [src]);

  const onError = useCallback(
    (e) => {
      if (!triedWebpRef.current) {
        const next = rasterUrlTryWebpVariant(effectiveSrc);
        if (next && next !== effectiveSrc) {
          triedWebpRef.current = true;
          setEffectiveSrc(next);
          return;
        }
      }
      onErrorProp?.(e);
    },
    [effectiveSrc, onErrorProp],
  );

  if (!effectiveSrc) return null;

  return <Image key={effectiveSrc} src={effectiveSrc} {...rest} onError={onError} />;
}

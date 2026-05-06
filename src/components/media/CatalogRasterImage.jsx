"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { rasterUrlTryWebpVariant } from "@/lib/mediaUrls";

/**
 * `<img>` para portadas marketplace: sin `next/image` (evita proxy `/_next/image`).
 * Con `candidates` de 2+ URLs no mezcla `rasterUrlTryWebpVariant` con el índice (evita bucle webp↔jpeg).
 * Con una sola URL o solo `src`, ante error prueba la variante `.webp` vía `rasterUrlTryWebpVariant`.
 *
 * @param {{ src?: string; candidates?: string[]; alt?: string; fill?: boolean; className?: string; sizes?: string; priority?: boolean; fetchPriority?: string; decoding?: string; onError?: (e: unknown) => void }} props
 */
export function CatalogRasterImage({
  src,
  candidates: candidatesProp,
  alt = "",
  fill = false,
  className = "",
  sizes,
  priority = false,
  fetchPriority,
  decoding = "async",
  onError: onErrorProp,
  ...rest
}) {
  const chain = useMemo(() => {
    if (Array.isArray(candidatesProp) && candidatesProp.length > 0) {
      return candidatesProp.map((u) => String(u).trim()).filter(Boolean);
    }
    if (src != null && String(src).trim() !== "") {
      return [String(src).trim()];
    }
    return [];
  }, [candidatesProp, src]);

  const chainKey = useMemo(() => chain.join("\u0001"), [chain]);

  /**
   * Reintento vía `rasterUrlTryWebpVariant` solo tiene sentido con **una** URL en cadena (p. ej. solo
   * `src`). Si el padre ya pasó **≥2 candidatos** (`RasterFromApiUrl` → `[.webp, .jpg]` o galería),
   * mezclar ese reintento con el avance de índice rompía el flujo: tras fallar webp se cargaba jpeg,
   * si jpeg fallaba se volvía a calcular webp desde jpeg y se reintentaba el mismo webp en bucle
   * → imagen rota permanente en listados.
   */
  const useWebpVariantRetry = useMemo(() => {
    if (!Array.isArray(candidatesProp)) return true;
    return candidatesProp.length <= 1;
  }, [candidatesProp]);

  const [effectiveSrc, setEffectiveSrc] = useState(() => chain[0] ?? "");
  const candidateIdxRef = useRef(0);
  const triedWebpRef = useRef(false);

  useEffect(() => {
    candidateIdxRef.current = 0;
    triedWebpRef.current = false;
    setEffectiveSrc(chain[0] ?? "");
  }, [chainKey, chain]);

  const onError = useCallback(
    (e) => {
      const cur = effectiveSrc;
      if (useWebpVariantRetry) {
        if (!triedWebpRef.current) {
          triedWebpRef.current = true;
          const nextW = rasterUrlTryWebpVariant(cur);
          if (nextW && nextW !== cur) {
            setEffectiveSrc(nextW);
            return;
          }
        }
      }
      triedWebpRef.current = false;
      const idx = candidateIdxRef.current + 1;
      if (idx < chain.length) {
        candidateIdxRef.current = idx;
        setEffectiveSrc(chain[idx]);
        return;
      }
      onErrorProp?.(e);
    },
    [effectiveSrc, chain, onErrorProp, useWebpVariantRetry],
  );

  const fillClass = fill ? "absolute inset-0 h-full w-full" : "";
  const mergedClass = [fillClass, className].filter(Boolean).join(" ");

  if (!effectiveSrc) {
    const label = alt && String(alt).trim() ? String(alt).trim() : "Imagen no disponible";
    return (
      <div
        role="img"
        aria-label={label}
        className={[
          fillClass,
          "flex items-center justify-center rounded-none bg-zinc-100 text-zinc-400",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-80"
            aria-hidden
          >
            <path
              d="M8.2 6.6 9.6 5h4.8l1.4 1.6H18a3 3 0 0 1 3 3v7.4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9.6a3 3 0 0 1 3-3h2.2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M12 17.2a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wide">Sin imagen</span>
        </div>
      </div>
    );
  }

  return (
    <img
      key={`${chainKey}:${effectiveSrc}`}
      src={effectiveSrc}
      alt={alt}
      className={mergedClass}
      loading={priority ? "eager" : "lazy"}
      decoding={decoding}
      {...(fetchPriority != null ? { fetchPriority } : {})}
      onError={onError}
      {...(sizes != null && sizes !== "" ? { sizes } : {})}
      {...rest}
    />
  );
}

"use client";

import { useState } from "react";

/**
 * Portada del centro: `<img>` nativo (evita restricciones de `next/image` + optimizador con URLs del API).
 */
export function MallCardCover({ imageUrl, title, placeholderClass, priority }) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return (
      <>
        <div
          className={`absolute inset-0 bg-gradient-to-br ${placeholderClass ?? "from-zinc-600 to-zinc-400"}`}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-zinc-950/35 backdrop-blur-[0.5px]" aria-hidden />
      </>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/55 via-zinc-950/10 to-transparent"
        aria-hidden
      />
    </>
  );
}

"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { normalizeMediaUrlForUi } from "@/services/api";

/**
 * Marca del owner (logo API o texto desde `/api/workspace/current/`).
 * Sin enlace propio: el header envuelve este bloque en `<Link href="/">` para evitar `<a>` anidados.
 */
export function MarketplaceBrand({ className = "" }) {
  const { workspace, loading, displayName } = useWorkspace();

  if (loading) {
    return (
      <span
        className={`inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 ${className}`}
      >
        <span className="inline-block h-8 w-24 animate-pulse rounded bg-zinc-200/90" aria-hidden />
      </span>
    );
  }

  const logo =
    workspace?.logo_mark_url || workspace?.logo_url || workspace?.favicon_url || null;
  const alt = displayName;

  if (logo) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <img
          src={normalizeMediaUrlForUi(logo)}
          alt={alt}
          className="h-8 w-auto max-h-9 object-contain sm:h-9"
          decoding="async"
        />
      </span>
    );
  }

  return (
    <span
      className={`text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl ${className}`}
    >
      {displayName}
    </span>
  );
}

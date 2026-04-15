"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { normalizeMediaUrlForUi } from "@/services/api";

/** Área fija del logotipo completo en cabecera (ancho × alto). */
const HEADER_LOGO_W = 150;
const HEADER_LOGO_H = 30;

/**
 * Logotipo completo horizontal en cabecera solo si existe `logo_url` en el API.
 * El isotipo (`logo_mark_url`) no se usa aquí: va solo en el pie (ver `Footer`).
 * Sin archivo: texto `displayName`. Sin enlace propio: el header envuelve en `<Link href="/">`.
 */
export function MarketplaceBrand({ className = "" }) {
  const { workspace, loading, displayName } = useWorkspace();

  if (loading) {
    return (
      <span
        className={`inline-flex items-center text-lg font-semibold tracking-tight text-zinc-900 ${className}`}
      >
        <span
          className="inline-block animate-pulse rounded bg-zinc-200/90"
          style={{ width: HEADER_LOGO_W, height: HEADER_LOGO_H }}
          aria-hidden
        />
      </span>
    );
  }

  const logoSrc =
    typeof workspace?.logo_url === "string" && workspace.logo_url.trim() !== ""
      ? workspace.logo_url.trim()
      : null;
  const alt = displayName;

  if (logoSrc) {
    return (
      <span
        className={`inline-flex items-center justify-start ${className}`}
        style={{ width: HEADER_LOGO_W, height: HEADER_LOGO_H }}
      >
        <img
          src={normalizeMediaUrlForUi(logoSrc)}
          alt={alt}
          width={HEADER_LOGO_W}
          height={HEADER_LOGO_H}
          className="max-h-[30px] max-w-[150px] object-contain object-left"
          decoding="async"
          fetchPriority="high"
        />
      </span>
    );
  }

  return (
    <span
      className={`max-w-[150px] truncate text-base font-semibold tracking-tight text-zinc-900 sm:text-lg ${className}`}
    >
      {displayName}
    </span>
  );
}

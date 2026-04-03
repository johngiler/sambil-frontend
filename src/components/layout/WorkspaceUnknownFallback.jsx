"use client";

import {
  PublivallaFallbackBadge,
  PublivallaFallbackChrome,
} from "@/components/layout/PublivallaFallbackChrome";
import { clientTenantSlug, TENANT_RESERVED_SUBDOMAINS } from "@/lib/tenant";

/**
 * Pantalla cuando el API no resuelve un owner para este host (slug inexistente o inactivo).
 * Subdominios reservados (www, api, cdn) no son slug de owner en el backend.
 */
export function WorkspaceUnknownFallback() {
  const slug = clientTenantSlug();
  const showSlug =
    slug &&
    slug !== "local" &&
    !TENANT_RESERVED_SUBDOMAINS.has(slug);

  return (
    <PublivallaFallbackChrome
      badge={<PublivallaFallbackBadge>Marketplace no disponible</PublivallaFallbackBadge>}
      title="No encontramos este espacio"
      description="La dirección que usas no corresponde a un operador activo en Publivalla. Revisa el enlace o el nombre del subdominio. Puedes volver al sitio principal de la plataforma con el botón de abajo."
      meta={
        showSlug ? (
          <div className="mx-auto mt-6 max-w-full">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Identificador solicitado
            </p>
            <p className="rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2.5 font-mono text-xs text-zinc-300">
              {slug}
            </p>
          </div>
        ) : null
      }
    />
  );
}

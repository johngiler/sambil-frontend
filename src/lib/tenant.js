/**
 * Identificador estable del tenant en el cliente (localStorage, carrito).
 * Debe alinearse con la resolución del backend (subdominio + TENANT_BASE_DOMAIN).
 */

/** Alineado al backend: no son slugs de owner. */
export const TENANT_RESERVED_SUBDOMAINS = new Set(["www", "api", "cdn"]);

/**
 * @returns {string}
 */
export function clientTenantSlug() {
  if (typeof window === "undefined") {
    const env = (process.env.NEXT_PUBLIC_WORKSPACE_SLUG || "").trim().toLowerCase();
    return env || "local";
  }
  const host = window.location.hostname.toLowerCase();
  const base = (process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN || "").trim().toLowerCase();

  if (host.endsWith(".localhost") && host !== "localhost") {
    const sub = host.slice(0, -".localhost".length);
    if (sub && !sub.includes(".") && !TENANT_RESERVED_SUBDOMAINS.has(sub)) {
      return sub;
    }
  }

  if (!base) {
    const env = (process.env.NEXT_PUBLIC_WORKSPACE_SLUG || "").trim().toLowerCase();
    return env || "local";
  }

  if (host === base || host === `www.${base}`) {
    const env = (process.env.NEXT_PUBLIC_WORKSPACE_SLUG || "").trim().toLowerCase();
    return env || "local";
  }
  const suf = `.${base}`;
  if (host.endsWith(suf)) {
    const sub = host.slice(0, -suf.length);
    if (sub && !sub.includes(".") && !TENANT_RESERVED_SUBDOMAINS.has(sub)) {
      return sub;
    }
  }
  const env = (process.env.NEXT_PUBLIC_WORKSPACE_SLUG || "").trim().toLowerCase();
  return env || "local";
}

/** Sufijo seguro para claves de `localStorage`. */
export function storageKeySuffix() {
  return clientTenantSlug().replace(/[^a-z0-9_-]/gi, "_");
}

/**
 * Cabecera para el API cuando el Host del backend no lleva subdominio (p. ej. 127.0.0.1:8000).
 * Alinea login y `/api/workspace/current/` con el mismo slug que `clientTenantSlug()`.
 * No enviar si el slug es el fallback genérico "local" (sin workspace real con ese nombre).
 */
export function workspaceSlugRequestHeaders() {
  if (typeof window === "undefined") return {};
  const slug = clientTenantSlug();
  if (!slug || slug === "local") return {};
  return { "X-Workspace-Slug": slug };
}

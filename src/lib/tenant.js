/**
 * Identificador estable del tenant en el cliente (localStorage, carrito).
 * Debe alinearse con la resolución del backend (subdominio + TENANT_BASE_DOMAIN).
 */

const RESERVED = new Set(["www", "api", "cdn"]);

/**
 * @returns {string}
 */
export function clientTenantSlug() {
  if (typeof window === "undefined") {
    const env = (process.env.NEXT_PUBLIC_WORKSPACE_SLUG || "").trim().toLowerCase();
    return env || "local";
  }
  const base = (process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN || "").trim().toLowerCase();
  if (!base) {
    const env = (process.env.NEXT_PUBLIC_WORKSPACE_SLUG || "").trim().toLowerCase();
    return env || "local";
  }
  const host = window.location.hostname.toLowerCase();
  if (host === base || host === `www.${base}`) {
    const env = (process.env.NEXT_PUBLIC_WORKSPACE_SLUG || "").trim().toLowerCase();
    return env || "local";
  }
  const suf = `.${base}`;
  if (host.endsWith(suf)) {
    const sub = host.slice(0, -suf.length);
    if (sub && !sub.includes(".") && !RESERVED.has(sub)) {
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

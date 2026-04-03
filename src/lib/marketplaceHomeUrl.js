import { TENANT_RESERVED_SUBDOMAINS } from "@/lib/tenant";

/**
 * URL del inicio sin subdominio de tenant (p. ej. `http://localhost:3000` desde `nobis.localhost:3000`).
 * Reservados `www`, `api`, `cdn` no se tratan como slug de owner.
 * Si no se puede inferir, devuelve `"/"`.
 */
export function marketplaceHomeUrl() {
  if (typeof window === "undefined") return "/";
  const protocol = window.location.protocol;
  const port = window.location.port;
  const portPart = port ? `:${port}` : "";
  const host = window.location.hostname.toLowerCase();

  const base = (process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN || "").trim().toLowerCase();
  if (base) {
    if (host === base || host === `www.${base}`) {
      return `${protocol}//${host}${portPart}/`;
    }
    const suffix = `.${base}`;
    if (host.endsWith(suffix)) {
      const sub = host.slice(0, -suffix.length);
      if (sub && !TENANT_RESERVED_SUBDOMAINS.has(sub)) {
        return `${protocol}//${base}${portPart}/`;
      }
    }
    return "/";
  }

  if (host.endsWith(".localhost") && host !== "localhost") {
    const sub = host.slice(0, -".localhost".length);
    if (sub && !TENANT_RESERVED_SUBDOMAINS.has(sub) && !sub.includes(".")) {
      return `${protocol}//localhost${portPart}/`;
    }
  }

  return "/";
}

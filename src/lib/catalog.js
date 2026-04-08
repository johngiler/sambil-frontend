/**
 * Metadatos de centro por slug cuando no hay API (offline).
 * En operación normal los títulos vienen de `/api/centers/{slug}/`.
 */
const FALLBACK_MALL_META = {};

/**
 * @param {string} slug
 * @returns {{ title: string, subtitle: string } | null}
 */
export function getMallMeta(slug) {
  const key = String(slug || "").trim().toLowerCase();
  return FALLBACK_MALL_META[key] ?? null;
}

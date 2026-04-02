/**
 * Metadatos de centro por código cuando no hay API (offline).
 * En operación normal los títulos vienen de `/api/centers/{code}/`.
 */
const FALLBACK_MALL_META = {};

/**
 * @param {string} code
 * @returns {{ title: string, subtitle: string } | null}
 */
export function getMallMeta(code) {
  const u = String(code || "").toUpperCase();
  return FALLBACK_MALL_META[u] ?? null;
}

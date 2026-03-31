/** Fallback si `/api/centers/{code}/` no está disponible (offline). */
const FALLBACK_MALL_META = {
  SCC: { title: "CARACAS — CHACAO", subtitle: "Sambil Caracas" },
  SLC: { title: "CARACAS — LA CANDELARIA", subtitle: "Sambil La Candelaria" },
};

/**
 * @param {string} code
 * @returns {{ title: string, subtitle: string } | null}
 */
export function getMallMeta(code) {
  const u = String(code || "").toUpperCase();
  return FALLBACK_MALL_META[u] ?? null;
}

/**
 * Convierte respuesta de `/api/centers/` al shape esperado por `MallCard` y filtros de portada.
 */

import { normalizeMediaUrlForUi } from "@/services/api";

/**
 * Nombres de centros con catálogo de reservas (texto para portada; evita códigos internos).
 * @param {Array<Record<string, unknown>>} centers
 */
export function formatCatalogCenterList(centers) {
  const labels = (Array.isArray(centers) ? centers : [])
    .filter((c) => c.marketplace_enabled && c.is_active !== false)
    .map((c) => {
      const name = typeof c.name === "string" ? c.name.trim() : "";
      if (name) return name;
      const code = c.code != null ? String(c.code).trim() : "";
      return code || "";
    })
    .filter(Boolean);
  if (labels.length === 0) return "ninguno por ahora";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} y ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
}

const PLACEHOLDER_CLASSES = [
  "from-[#1e1b4b] via-[#4c1d95] to-[#0369a1]",
  "from-[#312e81] via-[#701a75] to-[#0c4a6e]",
  "from-[#2c2c81] via-[#a0034e] to-[#ca8a04]",
  "from-[#0f172a] via-[#5b21b6] to-[#0e7490]",
  "from-[#1e3a5f] via-[#601964] to-[#b45309]",
  "from-[#312e81] via-[#831843] to-[#0369a1]",
];

/**
 * @param {Array<Record<string, unknown>>} centers
 */
export function mapApiCentersToHomeMalls(centers) {
  if (!Array.isArray(centers)) return [];
  return centers.map((c, index) => {
    const code = c.code != null ? String(c.code).toUpperCase() : "";
    const centerActive = c.is_active !== false;
    const catalogEnabled = Boolean(c.marketplace_enabled);
    const rawCover =
      (typeof c.cover_image_url === "string" && c.cover_image_url.trim() !== ""
        ? c.cover_image_url.trim()
        : null) ||
      (typeof c.cover_image === "string" && c.cover_image.trim() !== "" ? c.cover_image.trim() : null);
    const imageUrl = rawCover ? normalizeMediaUrlForUi(rawCover) || null : null;
    return {
      id: `center-${c.id}`,
      apiId: c.id,
      code,
      title: typeof c.display_title === "string" ? c.display_title : code,
      subtitle: typeof c.name === "string" ? c.name : "",
      /** Flag en BD: catálogo de tomas habilitado para el centro. */
      catalogEnabled,
      /** Registro operativo activo (`ShoppingCenter.is_active`). */
      centerActive,
      /** Reservable en marketplace: activo y catálogo habilitado. */
      enabled: centerActive && catalogEnabled,
      imageUrl,
      priorityCover: index < 2,
      placeholderClass: PLACEHOLDER_CLASSES[index % PLACEHOLDER_CLASSES.length],
    };
  });
}

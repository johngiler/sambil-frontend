/**
 * Si la URL apunta a un raster (.jpg, .jpeg, .png, .gif), devuelve la misma ruta con extensión `.webp`.
 * Útil cuando la BD o el API aún devuelven la ruta antigua pero en disco solo existe el WebP.
 */
export function rasterUrlTryWebpVariant(url) {
  if (!url || typeof url !== "string") return "";
  const t = url.trim();
  if (!t) return "";
  if (/\.webp(\?|#|$)/i.test(t)) return "";
  if (!/\.(jpe?g|png|gif)(\?|#|$)/i.test(t)) return "";
  try {
    const u = new URL(t);
    const path = u.pathname;
    if (!/\.(jpe?g|png|gif)$/i.test(path)) return "";
    u.pathname = path.replace(/\.(jpe?g|png|gif)$/i, ".webp");
    return u.toString();
  } catch {
    return t.replace(/\.(jpe?g|png|gif)(?=(\?|#|$))/i, ".webp");
  }
}

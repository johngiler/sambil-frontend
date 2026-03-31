/**
 * IDs 90001–90099 se usaron en el pasado para tomas ficticias sin fila en BD.
 * Se eliminan del carrito guardado para no bloquear checkout con inventario real.
 */

export function isDemoCatalogSpaceId(id) {
  const n = Number(id);
  return Number.isFinite(n) && n >= 90001 && n <= 90099;
}

/**
 * @param {unknown} items
 * @returns {Array<{ id: unknown, code?: string, title?: string, monthly_price_usd?: string }>}
 */
export function sanitizeCartItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter(
      (i) =>
        i != null &&
        typeof i === "object" &&
        i.id != null &&
        !isDemoCatalogSpaceId(i.id),
    )
    .map(({ demo: _d, ...rest }) => rest);
}

/**
 * Respaldo en cliente si el API aún no envía `code` en el pedido.
 * La fuente de verdad es `Order.code` (único, persistido).
 */

/** Longitud del sufijo numérico en la referencia (#OWNER-ORDER-000001). */
const ORDER_REF_PAD = 6;

/**
 * Segmento “owner” estable para URLs y etiquetas (slug del workspace en mayúsculas).
 * @param {string} [slug]
 */
function sanitizeWorkspaceOwnerSegment(slug) {
  if (typeof slug !== "string") return "OWNER";
  const s = slug.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if (s.length === 0) return "OWNER";
  return s.slice(0, 32);
}

/**
 * Referencia legible del pedido en listados (no es número legal de factura).
 * Formato: `#<WORKSPACE_SLUG>-ORDER-<id con ceros a la izquierda>`.
 *
 * @param {number|string} orderId
 * @param {string} [workspaceSlug] Slug del tenant (`client.workspace.slug` desde el API).
 */
export function orderListReference(orderId, workspaceSlug) {
  const n = Number(orderId);
  const suffix =
    Number.isFinite(n) && n >= 0
      ? String(Math.trunc(n)).padStart(ORDER_REF_PAD, "0")
      : String(orderId ?? "").replace(/\s+/g, "") || "0";

  const owner = sanitizeWorkspaceOwnerSegment(workspaceSlug);
  return `#${owner}-ORDER-${suffix}`;
}

/** Referencia visual de pedido en listados (no es número legal de factura). */
export function orderListReference(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return `SBL-${id}`;
  return `SBL-${n.toString(36).toUpperCase()}`;
}

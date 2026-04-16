/** Fechas de alquiler (mínimo 1 mes de calendario, alineado con backend). */

export const MIN_RESERVATION_CALENDAR_MONTHS = 1;

export function toISODateOnly(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODateOnly(s) {
  const [y, m, d] = String(s).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Primer día del mes siguiente y último día de ese mismo mes (1 mes calendario inclusivo). */
export function defaultRentalPeriod() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  return { start_date: toISODateOnly(start), end_date: toISODateOnly(end) };
}

export function contractMonthsInclusive(startStr, endStr) {
  const s = parseISODateOnly(startStr);
  const e = parseISODateOnly(endStr);
  if (e < s) return 0;
  return (
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1
  );
}

export function lineSubtotal(monthlyUsd, startStr, endStr) {
  const months = contractMonthsInclusive(startStr, endStr);
  const n = Number(monthlyUsd);
  if (!Number.isFinite(n) || months <= 0) return 0;
  return Math.round(n * months * 100) / 100;
}

/** Suma subtotales usando `start_date` / `end_date` de cada línea del carrito. */
export function cartTotalUsd(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, row) => {
    if (typeof row.start_date !== "string" || typeof row.end_date !== "string")
      return sum;
    return (
      sum + lineSubtotal(row.monthly_price_usd, row.start_date, row.end_date)
    );
  }, 0);
}

/** Fechas presentes y contrato ≥ 1 mes de calendario (regla checkout). */
export function cartItemDatesValidForCheckout(item) {
  if (
    !item ||
    typeof item.start_date !== "string" ||
    typeof item.end_date !== "string"
  )
    return false;
  return (
    contractMonthsInclusive(item.start_date, item.end_date) >=
    MIN_RESERVATION_CALENDAR_MONTHS
  );
}

export function cartAllItemsMeetCheckoutRules(items) {
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.every(cartItemDatesValidForCheckout)
  );
}

/** Subtotal de una línea o null si no cumple mínimo / faltan fechas. */
export function cartLineSubtotalOrNull(item) {
  if (!cartItemDatesValidForCheckout(item)) return null;
  return lineSubtotal(item.monthly_price_usd, item.start_date, item.end_date);
}

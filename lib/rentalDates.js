/** Fechas de alquiler (regla ≥5 meses calendario, alineada con backend). */

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

/** Primer día del mes siguiente y último día del 5.º mes (incl.), p.ej. abr–ago. */
export function defaultRentalPeriod() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 5);
  end.setDate(end.getDate() - 1);
  return { start_date: toISODateOnly(start), end_date: toISODateOnly(end) };
}

export function contractMonthsInclusive(startStr, endStr) {
  const s = parseISODateOnly(startStr);
  const e = parseISODateOnly(endStr);
  if (e < s) return 0;
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
}

export function lineSubtotal(monthlyUsd, startStr, endStr) {
  const months = contractMonthsInclusive(startStr, endStr);
  const n = Number(monthlyUsd);
  if (!Number.isFinite(n) || months <= 0) return 0;
  return Math.round(n * months * 100) / 100;
}

export function cartTotalUsd(items, startStr, endStr) {
  return items.reduce((sum, row) => sum + lineSubtotal(row.monthly_price_usd, startStr, endStr), 0);
}

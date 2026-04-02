/** Precios marketplace (referencia plantilla: subtotal + IVA 16 %). */

export const IVA_RATE = 0.16;

export function roundMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
}

export function ivaFromSubtotal(subtotal) {
  return roundMoney(roundMoney(subtotal) * IVA_RATE);
}

export function totalWithIva(subtotal) {
  const s = roundMoney(subtotal);
  return roundMoney(s + ivaFromSubtotal(s));
}

export function formatUsdInteger(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(x);
}

export function formatUsdMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(x);
}

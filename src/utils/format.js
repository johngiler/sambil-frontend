export function formatUsd(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** Convierte el valor `payment_method` del API al id usado en la UI (Mis pedidos, checkout). */
export function apiPaymentMethodToCheckoutId(apiValue) {
  const v = String(apiValue || "").trim();
  if (v === "bank_transfer") return "transfer";
  if (v === "zelle") return "zelle";
  if (v === "crypto") return "crypto";
  if (v === "card") return "card";
  if (v === "mobile_payment" || v === "cash" || v === "other") return "transfer";
  return "transfer";
}

/** Valores del modelo `OrderPaymentMethod` (backend). */
export function checkoutPaymentMethodToApi(checkoutStepId) {
  switch (checkoutStepId) {
    case "transfer":
      return "bank_transfer";
    case "zelle":
      return "zelle";
    case "crypto":
      return "crypto";
    case "card":
    default:
      return "card";
  }
}

export function isPdfReceiptUrl(url) {
  if (!url || typeof url !== "string") return false;
  return /\.pdf(\?|#|$)/i.test(url);
}

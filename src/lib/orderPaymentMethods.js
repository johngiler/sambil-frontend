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

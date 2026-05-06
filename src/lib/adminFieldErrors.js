export function humanizeDrfErrorMessage(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";

  const map = new Map([
    ["This field may not be blank.", "Campo obligatorio."],
    ["This field is required.", "Campo obligatorio."],
    ["Not a valid string.", "Valor inválido."],
    ["Enter a valid email address.", "Correo inválido."],
    ["Enter a valid URL.", "URL inválida."],
    ["A valid integer is required.", "Debe ser un número entero."],
    ["A valid number is required.", "Debe ser un número."],
    ["Ensure this field has at least 1 characters.", "Completa este campo."],
  ]);
  if (map.has(s)) return map.get(s);

  // Django/DRF en inglés, aproximaciones comunes
  if (s.toLowerCase().includes("may not be blank")) return "Campo obligatorio.";
  if (s.toLowerCase().includes("is required")) return "Campo obligatorio.";
  if (s.toLowerCase().includes("enter a valid email")) return "Correo inválido.";
  if (s.toLowerCase().includes("enter a valid url")) return "URL inválida.";

  return s;
}

/**
 * Convierte `e.data` de DRF (dict de listas/strings) a mapa { field: msg }.
 */
export function fieldErrorsFromDrfData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v == null) continue;
    if (typeof v === "string") {
      out[k] = humanizeDrfErrorMessage(v);
      continue;
    }
    if (Array.isArray(v)) {
      out[k] = v.map(humanizeDrfErrorMessage).filter(Boolean).join("\n");
      continue;
    }
    if (typeof v === "object" && v.detail != null) {
      out[k] = humanizeDrfErrorMessage(v.detail);
      continue;
    }
    out[k] = humanizeDrfErrorMessage(String(v));
  }
  return out;
}


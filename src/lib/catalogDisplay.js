import { SPACE_TYPES } from "@/components/admin/adminConstants";

const TITLE_SMALL_WORDS = new Set([
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "y",
  "e",
  "o",
  "a",
  "en",
  "al",
  "por",
  "con",
]);

/**
 * Título unificado en catálogo: si viene casi todo en mayúsculas (PDF/import), pasa a título legible.
 * Si ya mezcla mayúsculas/minúsculas, se respeta el texto original.
 * @param {unknown} raw
 */
export function formatCatalogTitle(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";

  const letters = s.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, "");
  if (letters.length < 4) return s;

  const upper = (letters.match(/[A-ZÁÉÍÓÚÜÑ]/g) || []).length;
  const mostlyUpper = upper / letters.length > 0.6;
  if (!mostlyUpper) return s;

  return s
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (!word) return word;
      if (index > 0 && TITLE_SMALL_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * @param {unknown} value Código `type` del API.
 * @param {unknown} [typeLabelFromApi] `type_label` del serializer.
 */
export function spaceTypeLabel(value, typeLabelFromApi) {
  if (typeof typeLabelFromApi === "string" && typeLabelFromApi.trim() !== "") {
    return typeLabelFromApi.trim();
  }
  const v = String(value ?? "").trim();
  if (!v) return "";
  const row = SPACE_TYPES.find((t) => t.v === v);
  return row?.l ?? v;
}

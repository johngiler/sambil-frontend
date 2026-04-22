/**
 * Radio uniforme para botones, campos y tarjetas del admin/dashboard (15px).
 * En `src/app/globals.css`, `--mp-control-radius` debe coincidir.
 * Excepciones explícitas: botón Panel (Header) y filtros del home (chips y bloque de búsqueda).
 */
export const ROUNDED_CONTROL = "rounded-[15px]";

/** Contenedor padre de `PdfPreview` compact y tarjetas equivalentes en rejilla de documentos (interior recto). */
export const ROUNDED_PDF_GRID_CARD = "rounded-[5px]";

/** Preferir `rounded-[10px]` literal en `AdminModal.js` / CSS para Tailwind. */
export const ROUNDED_ADMIN_MODAL = "rounded-[10px]";

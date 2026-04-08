/**
 * Miniaturas cuadradas compartidas: radio **10px** en todos los marcos de esta lib.
 * - 100×100: lightbox, galería admin de toma, comprobante checkout (`squareListImagePreview*`).
 * - 60×60: columna Portada en tablas admin CC y tomas; miniaturas en «Reserva — líneas» de Mis pedidos (`squareAdminTablePortada*`).
 * - Líneas de pedido (solo admin): ancho **120px**, **alto = fila** (`squareOrderLinePreview*`).
 * No usar en portadas hero del catálogo ni en avatares circulares de persona.
 */
export const squareListImagePreviewFrameClass =
  "relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[10px] border border-zinc-200/90 bg-zinc-100 shadow-sm";

export const squareListImagePreviewImgClass = "h-full w-full object-cover";

/** Columna «Portada» en tablas admin (centros, tomas). */
export const squareAdminTablePortadaFrameClass =
  "relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[10px] border border-zinc-200/90 bg-zinc-100 shadow-sm";

export const squareAdminTablePortadaImgClass = "h-full w-full object-cover";

/** Tarjetas de línea en pedido: misma altura que el bloque de texto (`items-stretch` en la fila). */
export const squareOrderLinePreviewFrameClass =
  "relative flex w-[120px] shrink-0 self-stretch min-h-[120px] overflow-hidden rounded-[10px] border border-zinc-200/90 bg-zinc-100 shadow-sm";

export const squareOrderLinePreviewImgClass = "min-h-0 h-full w-full flex-1 object-cover";

/** Anillos hover/focus para botones que abren lightbox (Mis pedidos, etc.). */
export const squareListImagePreviewButtonRingClass =
  "group transition hover:ring-2 hover:ring-[color-mix(in_srgb,var(--mp-primary)_38%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_45%,transparent)]";

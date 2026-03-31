/* `rounded-[15px]` debe aparecer literal aquí: Tailwind no siempre genera utilidades solo referenciadas vía import. */

export const adminField =
  "mt-1 w-full min-h-10 rounded-[15px] border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-[#0c9dcf]/50 focus:outline-none focus:ring-2 focus:ring-[#0c9dcf]/15";

export const adminLabel = "text-xs font-semibold uppercase tracking-wide text-zinc-500";

export const adminPrimaryBtn =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[15px] bg-gradient-to-r from-[#007bb3] via-[#0c9dcf] to-[#3ec5f7] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0c9dcf]/25 transition hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9dcf]/45 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

/** Texto del botón crear (alineado con el icono + en `AdminCreatePlusIcon`). */
export const adminCreateBtnLabel = "leading-none";

export const adminSecondaryBtn =
  "inline-flex cursor-pointer items-center justify-center rounded-[15px] border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed";

export const adminPanelCard =
  "rounded-[15px] border border-sky-100/90 bg-gradient-to-br from-sky-50/50 via-white to-white p-5 shadow-sm ring-1 ring-sky-100/40 sm:p-6";

/** Icono junto al título de sección: caja fija y contenido centrado (evita que el SVG quede arriba al estirarse la fila). */
export const adminSectionHeaderIconWrap =
  "hidden shrink-0 sm:flex sm:size-14 sm:items-center sm:justify-center rounded-[15px] bg-sky-100/80 text-[#0c9dcf]";

export const adminTableCard = "overflow-hidden rounded-[15px] border border-zinc-200/90 bg-white shadow-sm";

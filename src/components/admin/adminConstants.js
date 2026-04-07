/** Tipos de toma: genéricos + formatos de catálogo PDF (espacios publicitarios en CC). */
export const SPACE_TYPES = [
  { v: "billboard", l: "Valla (genérico)" },
  { v: "banner", l: "Banner / pendón (genérico)" },
  { v: "elevator", l: "Ascensor" },
  { v: "other", l: "Otro" },
  { v: "valla_vertical", l: "Valla vertical / gigantografía vertical" },
  { v: "valla_horizontal", l: "Valla horizontal / gigantografía horizontal" },
  { v: "gigantografia_fachada", l: "Gigantografía en fachada" },
  { v: "pendon_balcon", l: "Pendón de balcón" },
  { v: "pendon_atrio", l: "Pendón de atrio / colgante central" },
  { v: "pendon_pasillo", l: "Pendón de pasillo" },
  { v: "pendon_plaza", l: "Pendón de plaza" },
  { v: "pendon_columna", l: "Pendón de columna" },
];

export const SPACE_STATUS = [
  { v: "available", l: "Disponible" },
  { v: "reserved", l: "Reservado" },
  { v: "occupied", l: "Ocupado" },
  { v: "blocked", l: "Bloqueado" },
];

export const CLIENT_STATUS = [
  { v: "active", l: "Activo" },
  { v: "suspended", l: "Suspendido" },
];

/** Texto en español para el código de estado de cliente (API puede enviar `status_label`). */
export function clientStatusLabel(status, statusLabelFromApi) {
  if (typeof statusLabelFromApi === "string" && statusLabelFromApi.trim() !== "") {
    return statusLabelFromApi.trim();
  }
  const o = CLIENT_STATUS.find((x) => String(x.v) === String(status ?? ""));
  return o ? o.l : status ? String(status) : "—";
}

/** Píldora tipo listado Centros / Activo: verde activo, ámbar suspendido. */
export function clientStatusPillClassName(status) {
  const s = String(status ?? "");
  if (s === "active") return "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80";
  if (s === "suspended") return "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80";
  return "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200/80";
}

/** Texto en español; el API puede enviar `status_label` (get_status_display). */
export function spaceStatusLabel(status, statusLabelFromApi) {
  if (typeof statusLabelFromApi === "string" && statusLabelFromApi.trim() !== "") {
    return statusLabelFromApi.trim();
  }
  const o = SPACE_STATUS.find((x) => String(x.v) === String(status ?? ""));
  return o ? o.l : status ? String(status) : "—";
}

export function spaceStatusPillClassName(status) {
  const s = String(status ?? "");
  if (s === "available") return "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80";
  if (s === "reserved") return "bg-sky-50 text-sky-900 ring-1 ring-sky-200/80";
  if (s === "occupied") return "bg-violet-50 text-violet-900 ring-1 ring-violet-200/80";
  if (s === "blocked") return "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80";
  return "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200/80";
}

/** Tipos de toma: genéricos + formatos tipo catálogo Sambil Caracas (PDF espacios publicitarios). */
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
  { v: "pending", l: "Pendiente" },
  { v: "active", l: "Activo" },
  { v: "suspended", l: "Suspendido" },
];

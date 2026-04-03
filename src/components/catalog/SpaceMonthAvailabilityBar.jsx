"use client";

import { availableMonthsCount, normalizeMonthsOccupied } from "@/lib/spaceCalendar";

const ACCENT = "bg-[#d98e32]";
const FREE = "bg-zinc-200/90";

/**
 * Franja de 12 meses (ocupado = acento; libre = gris).
 * @param {{ monthsOccupied?: unknown, className?: string, labelMetric?: "free" | "occupied" }} props
 */
export function SpaceMonthAvailabilityBar({
  monthsOccupied,
  className = "",
  labelMetric = "free",
}) {
  const occ = normalizeMonthsOccupied(monthsOccupied);
  const free = availableMonthsCount(occ);
  const occupied = 12 - free;
  const ariaFree = `Disponibilidad anual: ${free} de 12 meses libres`;
  const ariaOccupied = `Ocupación anual: ${occupied} de 12 meses con reservas o bloqueos`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex min-w-0 flex-1 gap-0.5"
        role="img"
        aria-label={labelMetric === "occupied" ? ariaOccupied : ariaFree}
      >
        {occ.map((busy, i) => (
          <span
            key={i}
            className={`h-1.5 min-w-0 flex-1 rounded-sm ${busy ? ACCENT : FREE}`}
            title={busy ? "Mes con reservas o bloqueos" : "Mes libre"}
          />
        ))}
      </div>
      <span className="shrink-0 tabular-nums text-[11px] font-medium text-zinc-500">
        {labelMetric === "occupied" ? `${occupied}/12 meses` : `${free}/12 meses`}
      </span>
    </div>
  );
}

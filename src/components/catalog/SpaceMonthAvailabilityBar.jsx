"use client";

import { availableMonthsCount, normalizeMonthsOccupied } from "@/lib/spaceCalendar";

const ACCENT = "bg-[#d98e32]";
const FREE = "bg-zinc-200/90";

/**
 * Franja de 12 meses (ocupado = acento; libre = gris). Referencia plantilla marketplace.
 * @param {{ monthsOccupied?: unknown, className?: string }} props
 */
export function SpaceMonthAvailabilityBar({ monthsOccupied, className = "" }) {
  const occ = normalizeMonthsOccupied(monthsOccupied);
  const free = availableMonthsCount(occ);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex min-w-0 flex-1 gap-0.5"
        role="img"
        aria-label={`Disponibilidad anual: ${free} de 12 meses libres`}
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
        {free}/12 meses
      </span>
    </div>
  );
}

"use client";

import { availableMonthsCount, normalizeMonthsOccupied } from "@/lib/spaceCalendar";

const ACCENT = "bg-[#d98e32]";
const FREE = "bg-zinc-200/90";

/**
 * Franja de 12 meses (ocupado = acento; libre = gris).
 * @param {{ monthsOccupied?: unknown, className?: string, labelMetric?: "free" | "occupied", variant?: "default" | "comfortable" }} props
 */
export function SpaceMonthAvailabilityBar({
  monthsOccupied,
  className = "",
  labelMetric = "free",
  variant = "default",
}) {
  const occ = normalizeMonthsOccupied(monthsOccupied);
  const free = availableMonthsCount(occ);
  const occupied = 12 - free;
  const ariaFree = `Disponibilidad anual: ${free} de 12 meses libres`;
  const ariaOccupied = `Ocupación anual: ${occupied} de 12 meses con reservas o bloqueos`;

  const comfortable = variant === "comfortable";
  const barGap = comfortable ? "gap-1" : "gap-0.5";
  const barH = comfortable ? "h-2" : "h-1.5";
  const countCls = comfortable
    ? "shrink-0 tabular-nums text-sm font-medium text-zinc-500"
    : "shrink-0 tabular-nums text-[11px] font-medium text-zinc-500";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex min-w-0 flex-1 ${barGap}`}
        role="img"
        aria-label={labelMetric === "occupied" ? ariaOccupied : ariaFree}
      >
        {occ.map((busy, i) => (
          <span
            key={i}
            className={`${barH} min-w-0 flex-1 rounded-sm ${busy ? ACCENT : FREE}`}
            title={busy ? "Mes con reservas o bloqueos" : "Mes libre"}
          />
        ))}
      </div>
      <span className={countCls}>
        {labelMetric === "occupied" ? `${occupied}/12 meses` : `${free}/12 meses`}
      </span>
    </div>
  );
}

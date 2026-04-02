"use client";

import { useCallback, useMemo, useState } from "react";

import {
  MONTH_SHORT_ES,
  monthRangeToIsoDates,
  normalizeMonthsOccupied,
  rangeTouchesOccupiedMonth,
} from "@/lib/spaceCalendar";
import { contractMonthsInclusive } from "@/lib/rentalDates";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

const ACCENT_RING = "border-[#d98e32] text-[#b45309] ring-1 ring-[#d98e32]/35";
const DISABLED = "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300";

/**
 * Selector de rango de meses dentro del año de disponibilidad del API (referencia plantilla).
 * Cada clic amplía el rango para incluir ese mes (contiguo automático entre mínimo y máximo elegidos).
 * @param {{
 *   availabilityYear: number,
 *   monthsOccupied?: unknown,
 *   monthlyPriceUsd: string | number,
 *   minMonths?: number,
 *   onRangeChange?: (payload: { start_date: string, end_date: string } | null) => void,
 * }} props
 */
export function SpaceMonthRangePicker({
  availabilityYear,
  monthsOccupied,
  monthlyPriceUsd,
  minMonths = 5,
  onRangeChange,
}) {
  const occ = useMemo(() => normalizeMonthsOccupied(monthsOccupied), [monthsOccupied]);
  const [startM, setStartM] = useState(null);
  const [endM, setEndM] = useState(null);

  const onMonthClick = useCallback(
    (m) => {
      if (occ[m - 1]) return;
      if (startM == null || endM == null) {
        setStartM(m);
        setEndM(m);
        onRangeChange?.(monthRangeToIsoDates(availabilityYear, m, m));
        return;
      }
      const s = Math.min(startM, endM, m);
      const e = Math.max(startM, endM, m);
      setStartM(s);
      setEndM(e);
      onRangeChange?.(monthRangeToIsoDates(availabilityYear, s, e));
    },
    [availabilityYear, endM, occ, onRangeChange, startM],
  );

  const reset = useCallback(() => {
    setStartM(null);
    setEndM(null);
    onRangeChange?.(null);
  }, [onRangeChange]);

  const rangeValid = startM != null && endM != null;
  const lo = rangeValid ? Math.min(startM, endM) : null;
  const hi = rangeValid ? Math.max(startM, endM) : null;
  const dates =
    lo != null && hi != null ? monthRangeToIsoDates(availabilityYear, lo, hi) : null;
  const spanMonths = dates ? contractMonthsInclusive(dates.start_date, dates.end_date) : 0;
  const touchesBlocked =
    lo != null && hi != null && rangeTouchesOccupiedMonth(availabilityYear, lo, hi, occ);
  const meetsMin = spanMonths >= minMonths;
  const price = Number(monthlyPriceUsd);
  const subtotal =
    meetsMin && Number.isFinite(price) ? Math.round(price * spanMonths * 100) / 100 : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-zinc-900">Selecciona meses</p>
        <p className="mt-1 text-xs text-zinc-500">
          Elige meses en {availabilityYear} para formar el período. Cada nuevo clic amplía el rango. Contrato
          mínimo: {minMonths} meses. Los meses deshabilitados tienen reservas o bloqueos.
        </p>
      </div>

      <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
        {MONTH_SHORT_ES.map((label, i) => {
          const m = i + 1;
          const blocked = occ[i];
          const inRange = lo != null && hi != null && m >= lo && m <= hi;
          return (
            <button
              key={label}
              type="button"
              disabled={blocked}
              onClick={() => onMonthClick(m)}
              className={`min-h-11 rounded-xl border text-xs font-semibold transition-colors sm:min-h-10 ${
                blocked
                  ? DISABLED
                  : inRange
                    ? `${ACCENT_RING} bg-orange-50/90`
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={reset}
          className="text-xs font-semibold text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline"
        >
          Limpiar selección
        </button>
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-3 ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50 px-4 py-3`}
      >
        <span className="text-sm text-zinc-600">
          {rangeValid ? (
            <>
              <span className="font-semibold tabular-nums text-zinc-900">{spanMonths}</span>{" "}
              {spanMonths === 1 ? "mes" : "meses"}
            </>
          ) : (
            "Sin rango"
          )}
        </span>
        <span className="text-lg font-semibold tabular-nums text-[#c2410c]">
          {subtotal != null ? `$${subtotal.toLocaleString("en-US")}` : "—"}
        </span>
      </div>

      {rangeValid && touchesBlocked ? (
        <p className="text-sm text-red-600">El rango incluye meses no disponibles. Ajusta la selección.</p>
      ) : null}
      {rangeValid && !touchesBlocked && !meetsMin ? (
        <p className="text-sm text-amber-800">
          Selecciona al menos {minMonths} meses de calendario para poder añadir al carrito.
        </p>
      ) : null}
    </div>
  );
}

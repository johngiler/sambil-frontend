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
 * Selector de rango de meses dentro del año de disponibilidad del API.
 * Cada clic amplía el rango para incluir ese mes (mínimo y máximo elegidos).
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

  const rangeLabel =
    lo != null && hi != null
      ? `${MONTH_SHORT_ES[lo - 1]} – ${MONTH_SHORT_ES[hi - 1]} ${availabilityYear}`
      : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-zinc-900">Calendario de meses</p>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-zinc-200 bg-white" aria-hidden />
            Disponible
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-zinc-100 ring-1 ring-zinc-200/80" aria-hidden />
            No disponible
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-orange-50 ring-1 ring-[#d98e32]/40" aria-hidden />
            En tu selección
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-2.5" role="group" aria-label={`Meses de ${availabilityYear}`}>
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
              aria-pressed={inRange}
              className={`min-h-11 rounded-xl border text-xs font-semibold transition-colors sm:min-h-10 ${
                blocked
                  ? DISABLED
                  : inRange
                    ? `${ACCENT_RING} bg-orange-50/90`
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={reset}
          className="text-sm font-semibold text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
        >
          Limpiar selección
        </button>
      </div>

      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50 px-4 py-4 sm:px-5`}
      >
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Rango elegido</p>
          <p className="text-sm font-medium text-zinc-900">
            {rangeLabel ? (
              <>
                {rangeLabel}
                <span className="ml-2 tabular-nums text-zinc-600">
                  ({spanMonths} {spanMonths === 1 ? "mes" : "meses"} en calendario)
                </span>
              </>
            ) : (
              <span className="text-zinc-500">Toca los meses de inicio y fin; el rango se completa entre ambos.</span>
            )}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total estimado</p>
          <p className="text-xl font-semibold tabular-nums text-[#c2410c] sm:text-2xl">
            {subtotal != null
              ? new Intl.NumberFormat("es-VE", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }).format(subtotal)
              : "—"}
          </p>
          {subtotal != null ? (
            <p className="mt-0.5 text-[11px] text-zinc-500">Precio mensual × meses del rango</p>
          ) : null}
        </div>
      </div>

      {rangeValid && touchesBlocked ? (
        <p className="text-sm font-medium text-red-600">El rango incluye meses no disponibles. Ajusta la selección.</p>
      ) : null}
      {rangeValid && !touchesBlocked && !meetsMin ? (
        <p className="text-sm text-amber-800">
          Amplía la selección hasta cubrir al menos <strong>{minMonths} meses</strong> de calendario (puedes tocar meses
          sueltos; el rango siempre es continuo de principio a fin).
        </p>
      ) : null}
    </div>
  );
}

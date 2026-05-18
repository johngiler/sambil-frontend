"use client";

import { useMemo } from "react";

import { SpaceMonthAvailabilityBar } from "@/components/catalog/SpaceMonthAvailabilityBar";
import {
  catalogAvailabilityYears,
  isMonthInCartIsoRange,
  monthBoundsFromIsoInYear,
  resolveMonthsOccupiedByYear,
} from "@/lib/spaceCalendar";

/**
 * Varias franjas anuales (catálogo / detalle).
 * @param {{
 *   space?: Record<string, unknown> | null,
 *   monthsOccupiedByYear?: Record<number, boolean[]>,
 *   cartStartIso?: string | null,
 *   cartEndIso?: string | null,
 *   className?: string,
 *   showLegend?: boolean,
 *   compact?: boolean,
 * }} props
 */
export function SpaceMultiYearAvailabilityBar({
  space = null,
  monthsOccupiedByYear: byYearProp = null,
  cartStartIso = null,
  cartEndIso = null,
  className = "",
  showLegend = true,
  compact = false,
}) {
  const refDate = useMemo(() => new Date(), []);
  const years = useMemo(() => catalogAvailabilityYears(refDate, space), [refDate, space]);
  const byYear = useMemo(
    () => byYearProp ?? resolveMonthsOccupiedByYear(space, refDate),
    [byYearProp, space, refDate],
  );

  return (
    <div className={`${compact ? "space-y-2" : "space-y-3"} ${className}`}>
      {years.map((year, i) => {
        const cartMonthsInYear =
          cartStartIso && cartEndIso
            ? monthBoundsFromIsoInYear(cartStartIso, cartEndIso, year)
            : null;
        const hasCartInYear =
          cartStartIso &&
          cartEndIso &&
          Array.from({ length: 12 }, (_, m) => m + 1).some((month) =>
            isMonthInCartIsoRange(cartStartIso, cartEndIso, year, month),
          );
        return (
          <div key={year}>
            <p
              className={
                compact
                  ? "mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"
                  : "mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500"
              }
            >
              {year}
            </p>
            <SpaceMonthAvailabilityBar
              monthsOccupied={byYear[year]}
              availabilityYear={year}
              cartMonthsInYear={hasCartInYear ? cartMonthsInYear : null}
              showLegend={showLegend && i === years.length - 1}
              legendPosition="below"
            />
          </div>
        );
      })}
    </div>
  );
}

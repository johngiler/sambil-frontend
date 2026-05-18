"use client";

import { useMemo } from "react";

import { SpaceMonthAvailabilityBar } from "@/components/catalog/SpaceMonthAvailabilityBar";
import { useCart } from "@/context/CartProvider";
import { monthBoundsFromIsoInYear } from "@/lib/spaceCalendar";

/**
 * Barra anual en ficha de detalle: meses en carrito en naranja y leyenda al hover.
 * @param {{ spaceId: number | string, monthsOccupied?: unknown, availabilityYear: number }} props
 */
export function SpaceDetailAvailabilityBar({ spaceId, monthsOccupied, availabilityYear }) {
  const { items } = useCart();

  const cartMonthsInYear = useMemo(() => {
    const line = items.find((i) => String(i.id) === String(spaceId));
    if (
      !line ||
      typeof line.start_date !== "string" ||
      typeof line.end_date !== "string"
    ) {
      return null;
    }
    return monthBoundsFromIsoInYear(line.start_date, line.end_date, availabilityYear);
  }, [items, spaceId, availabilityYear]);

  return (
    <div className="relative z-30 min-w-0">
      <SpaceMonthAvailabilityBar
        monthsOccupied={monthsOccupied}
        availabilityYear={availabilityYear}
        cartMonthsInYear={cartMonthsInYear}
      />
    </div>
  );
}

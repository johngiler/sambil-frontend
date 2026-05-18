"use client";

import { useMemo } from "react";

import { useCart } from "@/context/CartProvider";
import { monthBoundsFromIsoInYear } from "@/lib/spaceCalendar";

import { SpaceCard } from "./SpaceCard";

/**
 * Misma API que `SpaceCard`; marca `inCart` y meses reservados según el carrito.
 */
export function SpaceCardWithCart(props) {
  const { items } = useCart();
  const cartIds = useMemo(() => new Set(items.map((i) => String(i.id))), [items]);
  const sid = props.space?.id != null ? String(props.space.id) : "";
  const inCart = sid !== "" && cartIds.has(sid);
  const year = Number(props.space?.availability_year) || new Date().getFullYear();

  const cartMonthsInYear = useMemo(() => {
    if (!inCart) return null;
    const line = items.find((i) => String(i.id) === sid);
    if (
      !line ||
      typeof line.start_date !== "string" ||
      typeof line.end_date !== "string"
    ) {
      return null;
    }
    return monthBoundsFromIsoInYear(line.start_date, line.end_date, year);
  }, [inCart, items, sid, year]);

  return (
    <SpaceCard {...props} inCart={inCart} cartMonthsInYear={cartMonthsInYear} />
  );
}

"use client";

import { useMemo } from "react";

import { useCart } from "@/context/CartProvider";

import { SpaceCard } from "./SpaceCard";

/**
 * Misma API que `SpaceCard`; marca `inCart` según ítems del carrito en cliente.
 */
export function SpaceCardWithCart(props) {
  const { items } = useCart();
  const cartIds = useMemo(() => new Set(items.map((i) => String(i.id))), [items]);
  const sid = props.space?.id != null ? String(props.space.id) : "";
  const inCart = sid !== "" && cartIds.has(sid);
  return <SpaceCard {...props} inCart={inCart} />;
}

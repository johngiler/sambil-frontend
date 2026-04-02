"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { SpaceMonthRangePicker } from "@/components/catalog/SpaceMonthRangePicker";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartProvider";
import { contractMonthsInclusive } from "@/lib/rentalDates";
import {
  normalizeMonthsOccupied,
  rangeTouchesOccupiedMonth,
} from "@/lib/spaceCalendar";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

function isoYearMonth(iso) {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  return { y, m };
}

/**
 * Bloque de reserva en detalle de toma: período por meses + carrito.
 */
export function SpaceDetailReservationActions({ space }) {
  const { authReady, me, isClient, isAdmin } = useAuth();
  const { setRentalPeriod, addItem } = useCart();
  const [pick, setPick] = useState(null);

  const year = Number(space.availability_year) || new Date().getFullYear();
  const occ = useMemo(() => normalizeMonthsOccupied(space.months_occupied), [space.months_occupied]);

  const pickValid = useMemo(() => {
    if (!pick?.start_date || !pick?.end_date) return false;
    const { y: ys, m: sm } = isoYearMonth(pick.start_date);
    const { y: ye, m: em } = isoYearMonth(pick.end_date);
    if (ys !== year || ye !== year) return false;
    const lo = Math.min(sm, em);
    const hi = Math.max(sm, em);
    if (rangeTouchesOccupiedMonth(year, lo, hi, occ)) return false;
    return contractMonthsInclusive(pick.start_date, pick.end_date) >= 5;
  }, [pick, year, occ]);

  const onAdd = useCallback(() => {
    if (!pickValid || !pick) return;
    setRentalPeriod({ start_date: pick.start_date, end_date: pick.end_date });
    addItem(space);
  }, [addItem, pick, pickValid, setRentalPeriod, space]);

  if (!authReady) {
    return (
      <div className="mt-6 space-y-4" aria-busy="true">
        <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />
        <div className="h-11 max-w-xs animate-pulse rounded-xl bg-zinc-100" />
      </div>
    );
  }

  if (me && isAdmin) {
    return (
      <div
        className={`mt-6 ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-700`}
      >
        <p className="font-medium text-zinc-900">Carrito y checkout</p>
        <p className="mt-1">
          Como administrador, crea y gestiona pedidos desde el panel. El carrito del marketplace es para clientes.
        </p>
        <p className="mt-3">
          <Link href="/dashboard" className="font-semibold text-[#0c9dcf] underline-offset-4 hover:underline">
            Ir al panel
          </Link>
        </p>
      </div>
    );
  }

  if (me && !isClient) {
    return null;
  }

  const infoBox = (
    <div
      className={`mt-6 ${ROUNDED_CONTROL} border border-[#0c9dcf]/20 bg-[#0c9dcf]/[0.06] px-4 py-3 text-sm leading-relaxed text-zinc-700`}
    >
      <p className="font-medium text-zinc-900">Después de añadir</p>
      <p className="mt-1">
        En el <strong>Carrito</strong> puedes revisar el período y en <strong>Checkout</strong> los datos de la empresa
        para enviar la solicitud.
      </p>
    </div>
  );

  return (
    <>
      {infoBox}
      <div className={`mt-6 ${ROUNDED_CONTROL} border border-zinc-200 bg-white px-4 py-5 shadow-sm`}>
        <SpaceMonthRangePicker
          availabilityYear={year}
          monthsOccupied={space.months_occupied}
          monthlyPriceUsd={space.monthly_price_usd}
          minMonths={5}
          onRangeChange={setPick}
        />
      </div>
      <div className="mt-6">
        <button
          type="button"
          disabled={!pickValid}
          onClick={onAdd}
          className={`flex min-h-11 w-full items-center justify-center gap-2 ${ROUNDED_CONTROL} px-5 py-3 text-base font-semibold transition-colors duration-200 sm:text-sm ${
            pickValid
              ? "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.99]"
              : "cursor-not-allowed bg-zinc-200 text-zinc-500"
          }`}
        >
          Agregar al carrito
          <span aria-hidden>→</span>
        </button>
      </div>
    </>
  );
}

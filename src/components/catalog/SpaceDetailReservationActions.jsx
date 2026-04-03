"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { adminPrimaryBtn } from "@/components/admin/adminFormStyles";
import { marketplaceSecondaryBtn } from "@/lib/marketplaceActionButtons";
import { SpaceMonthRangePicker } from "@/components/catalog/SpaceMonthRangePicker";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartProvider";
import { contractMonthsInclusive } from "@/lib/rentalDates";
import { postSpaceRentalRangeCheck } from "@/services/api";
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
  const { items, addItem, updateItemDates } = useCart();
  const [pick, setPick] = useState(null);
  const [rangeCheckError, setRangeCheckError] = useState("");
  const [rangeCheckLoading, setRangeCheckLoading] = useState(false);

  const year = Number(space.availability_year) || new Date().getFullYear();
  const occ = useMemo(() => normalizeMonthsOccupied(space.months_occupied), [space.months_occupied]);

  const spaceInCart = useMemo(
    () => items.some((i) => String(i.id) === String(space.id)),
    [items, space.id],
  );

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

  useEffect(() => {
    setRangeCheckError("");
  }, [pick?.start_date, pick?.end_date]);

  const onConfirmDates = useCallback(async () => {
    if (!pickValid || !pick) return;
    setRangeCheckError("");
    setRangeCheckLoading(true);
    try {
      const r = await postSpaceRentalRangeCheck(space.id, {
        start_date: pick.start_date,
        end_date: pick.end_date,
      });
      if (!r.ok) {
        setRangeCheckError(
          typeof r.detail === "string" && r.detail.trim()
            ? r.detail.trim()
            : "Las fechas ya no están disponibles. Elige otro período.",
        );
        return;
      }
      if (items.some((i) => String(i.id) === String(space.id))) {
        updateItemDates(space.id, { start_date: pick.start_date, end_date: pick.end_date });
      } else {
        addItem(space, pick);
      }
    } catch (e) {
      setRangeCheckError(
        e instanceof Error ? e.message : "No se pudo comprobar la disponibilidad. Intenta de nuevo.",
      );
    } finally {
      setRangeCheckLoading(false);
    }
  }, [addItem, items, pick, pickValid, space, updateItemDates]);

  if (!authReady) {
    return (
      <div className="mt-10 space-y-4 border-t border-zinc-200 pt-10" aria-busy="true">
        <div className="h-48 animate-pulse rounded-2xl bg-zinc-100" />
        <div className="h-12 w-full max-w-md animate-pulse rounded-[15px] bg-zinc-100" />
      </div>
    );
  }

  if (me && isAdmin) {
    return (
      <div
        className={`mt-10 border-t border-zinc-200 pt-10 ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm leading-relaxed text-zinc-700 sm:px-6`}
      >
        <p className="font-medium text-zinc-900">Carrito y checkout</p>
        <p className="mt-1">
          Este proceso no está disponible para tu cuenta. Usa el acceso que te corresponde.
        </p>
        <p className="mt-3">
          <Link href="/dashboard" className="font-semibold text-zinc-900 underline-offset-4 hover:underline">
            Ir al panel
          </Link>
        </p>
      </div>
    );
  }

  if (me && !isClient) {
    return null;
  }

  return (
    <section
      className="mt-10 border-t border-zinc-200 pt-10"
      aria-labelledby="space-reservation-heading"
    >
      <div
        className={`overflow-hidden ${ROUNDED_CONTROL} border border-zinc-200/90 bg-white shadow-[0_2px_20px_-12px_rgba(15,23,42,0.12)] sm:rounded-2xl`}
      >
        <div className="border-b border-zinc-100 bg-zinc-50/60 px-5 py-5 sm:px-8 sm:py-6">
          <h2 id="space-reservation-heading" className="text-lg font-semibold tracking-tight text-zinc-950">
            Período de reserva
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Elige los meses de <strong className="font-medium text-zinc-800">{year}</strong> para tu campaña. Cada clic
            amplía el rango entre el mes más temprano y el más tardío que hayas tocado. Necesitas al menos{" "}
            <strong className="font-medium text-zinc-800">5 meses</strong> seguidos en calendario. Los meses atenuados no
            se pueden reservar.
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <SpaceMonthRangePicker
            availabilityYear={year}
            monthsOccupied={space.months_occupied}
            monthlyPriceUsd={space.monthly_price_usd}
            minMonths={5}
            onRangeChange={setPick}
          />
        </div>

        <div className="space-y-5 border-t border-zinc-100 bg-zinc-50/40 px-5 py-5 sm:px-8 sm:py-6">
          {rangeCheckError ? (
            <p
              role="alert"
              className={`break-words ${ROUNDED_CONTROL} bg-red-50 px-3 py-2 text-sm text-red-800`}
            >
              {rangeCheckError}
            </p>
          ) : null}
          {spaceInCart ? (
            <div className="flex flex-col gap-3">
              {pickValid ? (
                <button
                  type="button"
                  disabled={rangeCheckLoading}
                  onClick={() => void onConfirmDates()}
                  className={
                    !rangeCheckLoading
                      ? `${adminPrimaryBtn} min-h-12 w-full px-6 py-3.5 text-base sm:min-h-11 sm:text-sm`
                      : "inline-flex min-h-12 w-full cursor-wait items-center justify-center gap-2 rounded-[15px] border border-zinc-200 bg-zinc-100 px-6 py-3.5 text-base font-semibold text-zinc-500 sm:min-h-11 sm:text-sm"
                  }
                >
                  {rangeCheckLoading ? "Comprobando…" : "Guardar fechas de esta toma"}
                  {!rangeCheckLoading ? <span aria-hidden>→</span> : null}
                </button>
              ) : null}
              <Link
                href="/cart"
                className={`${pickValid ? marketplaceSecondaryBtn : adminPrimaryBtn} flex min-h-12 w-full items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold sm:min-h-11 sm:text-sm`}
              >
                Ir al carrito
                <span aria-hidden>→</span>
              </Link>
              {!pickValid ? (
                <p className="text-center text-xs text-zinc-500">
                  Elige un rango arriba para actualizar <strong className="font-medium text-zinc-700">solo esta toma</strong> en
                  el carrito; el resto de líneas conservan sus fechas.
                </p>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              disabled={!pickValid || rangeCheckLoading}
              onClick={() => void onConfirmDates()}
              className={
                pickValid && !rangeCheckLoading
                  ? `${adminPrimaryBtn} min-h-12 w-full px-6 py-3.5 text-base sm:min-h-11 sm:text-sm`
                  : "inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[15px] border border-zinc-200 bg-zinc-100 px-6 py-3.5 text-base font-semibold text-zinc-500 sm:min-h-11 sm:text-sm"
              }
            >
              {rangeCheckLoading ? "Comprobando…" : "Agregar al carrito"}
              {!rangeCheckLoading ? <span aria-hidden>→</span> : null}
            </button>
          )}
          {!pickValid && !spaceInCart ? (
            <p className="text-center text-xs text-zinc-500">
              Selecciona un rango válido (sin meses bloqueados y con mínimo de 5 meses) para habilitar el botón.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

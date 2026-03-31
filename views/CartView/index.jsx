"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartProvider";
import { EmptyState, EmptyStateIconCart } from "@/components/ui/EmptyState";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { cartTotalUsd, contractMonthsInclusive } from "@/lib/rentalDates";

export default function CartView() {
  const { authReady, me, isClient, isAdmin } = useAuth();
  const { items, removeItem, clear, rentalPeriod, setRentalPeriod } = useCart();

  const months =
    rentalPeriod.start_date && rentalPeriod.end_date
      ? contractMonthsInclusive(rentalPeriod.start_date, rentalPeriod.end_date)
      : 0;
  const meetsMin = months >= 5;
  const total = meetsMin ? cartTotalUsd(items, rentalPeriod.start_date, rentalPeriod.end_date) : 0;

  // Cliente: carrito normal.

  if (authReady && me && isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Carrito</h1>
        <p className="mt-4 text-zinc-600">
          El carrito del marketplace está pensado para visitantes sin sesión. Como administrador, crea y
          gestiona pedidos desde el panel.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/dashboard"
            className={`inline-flex min-h-11 items-center justify-center ${ROUNDED_CONTROL} bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800`}
          >
            Ir al panel
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-sm font-medium text-zinc-700 underline-offset-4 hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (authReady && me) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Carrito</h1>
        <p className="mt-4 text-zinc-600">
          El carrito del marketplace solo aplica sin iniciar sesión. Si necesitas ayuda, contacta a soporte.
        </p>
        <Link
          href="/"
          className={`mt-8 inline-flex min-h-11 items-center justify-center ${ROUNDED_CONTROL} bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800`}
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Carrito</h1>
      <p className="mt-2 text-zinc-600">
        Selección guardada en el navegador. El período de alquiler aplica a todas las tomas del
        carrito (mínimo 5 meses).
      </p>

      {items.length > 0 && authReady && !me ? (
        <p className={`mt-4 ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700`}>
          Para enviar la reserva necesitas credenciales que te asigne Sambil. Cuando las tengas, puedes{" "}
          <Link
            href="/login?next=/checkout"
            className="font-semibold text-zinc-900 underline-offset-4 hover:underline"
          >
            iniciar sesión
          </Link>{" "}
          aquí o en el checkout.
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className={`mt-8 ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50 p-4 sm:p-5`}>
          <p className="text-sm font-medium text-zinc-900">Período de contrato</p>
          <div className="mt-3 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1 text-sm">
              <span className="text-zinc-600">Inicio</span>
              <input
                type="date"
                value={rentalPeriod.start_date}
                onChange={(e) =>
                  setRentalPeriod((p) => ({ ...p, start_date: e.target.value }))
                }
                className={`min-h-11 w-full min-w-0 ${ROUNDED_CONTROL} border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#0c9dcf]/50 focus:outline-none focus:ring-2 focus:ring-[#0c9dcf]/20 sm:min-h-0 sm:py-2 sm:text-sm`}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1 text-sm">
              <span className="text-zinc-600">Fin</span>
              <input
                type="date"
                value={rentalPeriod.end_date}
                onChange={(e) =>
                  setRentalPeriod((p) => ({ ...p, end_date: e.target.value }))
                }
                className={`min-h-11 w-full min-w-0 ${ROUNDED_CONTROL} border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#0c9dcf]/50 focus:outline-none focus:ring-2 focus:ring-[#0c9dcf]/20 sm:min-h-0 sm:py-2 sm:text-sm`}
              />
            </label>
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            <span className="block sm:inline">
              Meses cubiertos: <span className="font-medium text-zinc-900">{months}</span>
            </span>
            {!meetsMin ? (
              <span className="mt-1 block text-amber-800 sm:mt-0 sm:ml-2 sm:inline">
                (mínimo 5 meses para enviar la solicitud)
              </span>
            ) : null}
          </p>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<EmptyStateIconCart />}
            title="Tu carrito está vacío"
            description="Añade tomas desde el catálogo de un centro. Todo se guarda en este navegador hasta que envíes la solicitud."
            action={
              <Link
                href="/"
                className={`inline-flex min-h-11 items-center justify-center ${ROUNDED_CONTROL} bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 sm:min-h-0`}
              >
                Ver centros
              </Link>
            }
          />
        </div>
      ) : (
        <ul className={`mt-8 divide-y divide-zinc-200 ${ROUNDED_CONTROL} border border-zinc-200 bg-white`}>
          {items.map((item) => {
            const line =
              meetsMin
                ? cartTotalUsd([item], rentalPeriod.start_date, rentalPeriod.end_date)
                : null;
            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium text-zinc-900">{item.title}</p>
                  <p className="text-sm text-zinc-500">{item.code}</p>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 sm:shrink-0 sm:justify-end">
                  <div className="text-sm text-zinc-600 sm:text-right">
                    <span className="font-semibold tabular-nums text-zinc-900">${item.monthly_price_usd}</span>
                    /mes × {meetsMin ? months : "—"} meses
                    {line != null ? (
                      <p className="text-xs text-zinc-500">Subtotal ${line.toFixed(2)} USD</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className={`min-h-11 shrink-0 ${ROUNDED_CONTROL} px-2 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 hover:underline active:scale-[0.98] sm:min-h-0`}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {items.length > 0 ? (
        <div className="mt-6 space-y-4">
          {meetsMin ? (
            <p className="text-lg font-semibold text-zinc-900">
              Total estimado: <span className="tabular-nums">${total.toFixed(2)} USD</span>
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={meetsMin ? "/checkout" : "#"}
              aria-disabled={!meetsMin}
              className={
                meetsMin
                  ? `inline-flex min-h-11 items-center justify-center ${ROUNDED_CONTROL} bg-zinc-900 px-5 py-2.5 text-center text-base font-semibold text-white transition-colors duration-200 hover:bg-zinc-800 active:scale-[0.99] sm:min-h-0 sm:text-sm`
                  : `inline-flex min-h-11 cursor-not-allowed items-center justify-center ${ROUNDED_CONTROL} bg-zinc-300 px-5 py-2.5 text-center text-base font-semibold text-zinc-500 transition-colors duration-200 sm:min-h-0 sm:text-sm`
              }
              onClick={(e) => {
                if (!meetsMin) e.preventDefault();
              }}
            >
              Ir a checkout
            </Link>
            <button
              type="button"
              onClick={() => clear()}
              className="min-h-11 text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-800 sm:min-h-0"
            >
              Vaciar carrito
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

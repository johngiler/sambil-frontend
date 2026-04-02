"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartProvider";
import { useWorkspace } from "@/context/WorkspaceContext";
import { EmptyState, EmptyStateIconCart } from "@/components/ui/EmptyState";
import {
  formatUsdInteger,
  formatUsdMoney,
  ivaFromSubtotal,
  totalWithIva,
} from "@/lib/marketplacePricing";
import { contractMonthShortLabels } from "@/lib/rentalMonthPills";
import { cartTotalUsd, contractMonthsInclusive } from "@/lib/rentalDates";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

const accent = "text-[#d98e32]";

const cardShell = `${ROUNDED_CONTROL} border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5`;

export default function CartView() {
  const { authReady, me, isClient, isAdmin } = useAuth();
  const { items, removeItem, clear, rentalPeriod, setRentalPeriod } = useCart();
  const { displayName } = useWorkspace();

  const months =
    rentalPeriod.start_date && rentalPeriod.end_date
      ? contractMonthsInclusive(rentalPeriod.start_date, rentalPeriod.end_date)
      : 0;
  const meetsMin = months >= 5;
  const subtotal = meetsMin ? cartTotalUsd(items, rentalPeriod.start_date, rentalPeriod.end_date) : 0;
  const iva = ivaFromSubtotal(subtotal);
  const grandTotal = totalWithIva(subtotal);
  const monthPills =
    rentalPeriod.start_date && rentalPeriod.end_date
      ? contractMonthShortLabels(rentalPeriod.start_date, rentalPeriod.end_date)
      : [];

  if (authReady && me && isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
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
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
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
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">
        Carrito{items.length > 0 ? ` (${items.length})` : ""}
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Selección en este navegador. El período de contrato aplica a todas las líneas (mínimo 5 meses de
        calendario).
      </p>

      {items.length > 0 && authReady && !me ? (
        <p className={`mt-4 ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700`}>
          Para enviar la reserva necesitas credenciales que te asigne {displayName}. Cuando las tengas, puedes{" "}
          <Link
            href="/login?next=/checkout"
            className="font-semibold text-zinc-900 underline-offset-4 hover:underline"
          >
            iniciar sesión
          </Link>{" "}
          antes del pago.
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className={`mt-8 ${cardShell}`}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">Período de contrato</p>
          <div className="mt-3 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1 text-sm">
              <span className="text-zinc-500">Inicio</span>
              <input
                type="date"
                value={rentalPeriod.start_date}
                onChange={(e) =>
                  setRentalPeriod((p) => ({ ...p, start_date: e.target.value }))
                }
                className={`min-h-11 w-full min-w-0 ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-base text-zinc-900 transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#d98e32]/50 focus:outline-none focus:ring-2 focus:ring-[#d98e32]/20 sm:min-h-0 sm:py-2 sm:text-sm`}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1 text-sm">
              <span className="text-zinc-500">Fin</span>
              <input
                type="date"
                value={rentalPeriod.end_date}
                onChange={(e) =>
                  setRentalPeriod((p) => ({ ...p, end_date: e.target.value }))
                }
                className={`min-h-11 w-full min-w-0 ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-base text-zinc-900 transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#d98e32]/50 focus:outline-none focus:ring-2 focus:ring-[#d98e32]/20 sm:min-h-0 sm:py-2 sm:text-sm`}
              />
            </label>
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            Meses cubiertos: <span className="font-semibold text-zinc-900">{months}</span>
            {!meetsMin ? (
              <span className="mt-1 block text-amber-800 sm:mt-0 sm:ml-2 sm:inline">
                (mínimo 5 para continuar)
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
        <ul className="mt-6 space-y-4">
          {items.map((item) => {
            const line =
              meetsMin
                ? cartTotalUsd([item], rentalPeriod.start_date, rentalPeriod.end_date)
                : null;
            const center =
              typeof item.shopping_center_name === "string" ? item.shopping_center_name : "";
            const detail =
              typeof item.detail_line === "string" ? item.detail_line : "";
            return (
              <li key={item.id} className={cardShell}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-base font-semibold text-zinc-900">
                      {item.title}
                      {center ? (
                        <>
                          {" "}
                          <span className="text-zinc-400">·</span> {center}
                        </>
                      ) : null}
                    </p>
                    {detail ? (
                      <p className="mt-1.5 break-words text-sm text-zinc-500">{detail}</p>
                    ) : (
                      <p className="mt-1.5 text-sm text-zinc-500">{item.code}</p>
                    )}
                    {monthPills.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {monthPills.map((label) => (
                          <span
                            key={`${item.id}-${label}`}
                            className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-row items-start justify-between gap-4 sm:flex-col sm:items-end">
                    {line != null ? (
                      <p className={`text-lg font-bold tabular-nums ${accent}`}>
                        {formatUsdInteger(line)}
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-400">—</p>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className={`shrink-0 text-sm font-semibold text-red-600 underline-offset-4 hover:underline`}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 ? (
        <div className={`mt-6 ${cardShell}`}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className={`font-semibold tabular-nums ${meetsMin ? accent : "text-zinc-400"}`}>
                {meetsMin ? formatUsdMoney(subtotal) : "—"}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>IVA (16 %)</span>
              <span className={`font-semibold tabular-nums ${meetsMin ? accent : "text-zinc-400"}`}>
                {meetsMin ? formatUsdMoney(iva) : "—"}
              </span>
            </div>
          </div>
          <div className="my-4 border-t border-zinc-200" />
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-base font-bold text-zinc-900">Total</span>
            <span className={`text-2xl font-bold tabular-nums ${meetsMin ? accent : "text-zinc-400"}`}>
              {meetsMin ? formatUsdInteger(grandTotal) : "—"}
            </span>
          </div>
          <Link
            href={meetsMin ? "/checkout" : "#"}
            aria-disabled={!meetsMin}
            className={`mt-6 flex min-h-12 w-full items-center justify-center ${ROUNDED_CONTROL} text-center text-base font-semibold transition-colors ${
              meetsMin
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "cursor-not-allowed bg-zinc-200 text-zinc-500"
            }`}
            onClick={(e) => {
              if (!meetsMin) e.preventDefault();
            }}
          >
            Proceder al pago
          </Link>
          <button
            type="button"
            onClick={() => clear()}
            className="mt-3 w-full text-center text-sm text-zinc-500 hover:text-zinc-800"
          >
            Vaciar carrito
          </button>
        </div>
      ) : null}
    </div>
  );
}

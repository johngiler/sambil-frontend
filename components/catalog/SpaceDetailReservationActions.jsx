"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/**
 * Bloque de reserva en detalle de toma: carrito solo para visitantes sin sesión.
 */
export function SpaceDetailReservationActions({ space }) {
  const { authReady, me, isClient, isAdmin } = useAuth();

  if (!authReady) {
    return (
      <div className="mt-6 space-y-4" aria-busy="true">
        <div className="h-24 animate-pulse rounded-xl bg-zinc-100" />
        <div className="h-11 max-w-xs animate-pulse rounded-xl bg-zinc-100" />
      </div>
    );
  }

  // Cliente: puede reservar desde catálogo (carrito/checkout).
  if (me && isClient) {
    return (
      <>
        <div
          className={`mt-6 ${ROUNDED_CONTROL} border border-[#0c9dcf]/20 bg-[#0c9dcf]/[0.06] px-4 py-3 text-sm leading-relaxed text-zinc-700`}
        >
          <p className="font-medium text-zinc-900">Después de añadir</p>
          <p className="mt-1">
            En el <strong>Carrito</strong> puedes definir las fechas del contrato (mínimo 5 meses) y en{" "}
            <strong>Checkout</strong> los datos de la empresa para enviar la solicitud.
          </p>
        </div>
        <div className="mt-6">
          <AddToCartButton space={space} />
        </div>
      </>
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

  if (me) return null;

  return (
    <>
      <div
        className={`mt-6 ${ROUNDED_CONTROL} border border-[#0c9dcf]/20 bg-[#0c9dcf]/[0.06] px-4 py-3 text-sm leading-relaxed text-zinc-700`}
      >
        <p className="font-medium text-zinc-900">Después de añadir</p>
        <p className="mt-1">
          En el <strong>Carrito</strong> puedes definir las fechas del contrato (mínimo 5 meses) y en{" "}
          <strong>Checkout</strong> los datos de la empresa para enviar la solicitud.
        </p>
      </div>
      <div className="mt-6">
        <AddToCartButton space={space} />
      </div>
    </>
  );
}

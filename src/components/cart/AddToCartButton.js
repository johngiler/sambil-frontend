"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartProvider";
import { defaultRentalPeriod } from "@/lib/rentalDates";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

export function AddToCartButton({ space }) {
  const { authReady, me, isClient } = useAuth();
  const { addItem } = useCart();

  // Solo clientes o visitantes pueden usar carrito (no admin).
  if (authReady && me && !isClient) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => addItem(space, defaultRentalPeriod())}
      className={`min-h-11 w-full ${ROUNDED_CONTROL} bg-violet-700 px-5 py-2.5 text-base font-semibold text-white transition-colors duration-200 ease-out hover:bg-violet-800 active:scale-[0.99] sm:w-auto sm:min-h-0 sm:text-sm`}
    >
      Añadir al carrito
    </button>
  );
}

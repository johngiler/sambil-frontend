"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { sanitizeCartItems } from "@/lib/demoCatalog";
import { defaultRentalPeriod } from "@/lib/rentalDates";
import { storageKeySuffix } from "@/lib/tenant";

const LEGACY_CART = "sambil-marketplace-cart";
const LEGACY_PERIOD = "sambil-marketplace-rental";

function cartStorageKey() {
  return `mp_cart_${storageKeySuffix()}`;
}

function periodStorageKey() {
  return `mp_rental_${storageKeySuffix()}`;
}

function clearLegacyCartKeys() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_CART);
    localStorage.removeItem(LEGACY_PERIOD);
  } catch {
    /* ignore */
  }
}

function readStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(cartStorageKey());
    const arr = raw ? JSON.parse(raw) : [];
    return sanitizeCartItems(arr);
  } catch {
    return [];
  }
}

function writeStorage(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(cartStorageKey(), JSON.stringify(sanitizeCartItems(items)));
}

function readPeriod() {
  if (typeof window === "undefined") return defaultRentalPeriod();
  try {
    const raw = localStorage.getItem(periodStorageKey());
    if (!raw) return defaultRentalPeriod();
    const p = JSON.parse(raw);
    if (p?.start_date && p?.end_date) return p;
  } catch {
    /* fallthrough */
  }
  return defaultRentalPeriod();
}

function writePeriod(p) {
  if (typeof window === "undefined") return;
  localStorage.setItem(periodStorageKey(), JSON.stringify(p));
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [rentalPeriod, setRentalPeriodState] = useState(defaultRentalPeriod);

  useEffect(() => {
    clearLegacyCartKeys();
    setItems(readStorage());
    setRentalPeriodState(readPeriod());
  }, []);

  const setRentalPeriod = useCallback((next) => {
    setRentalPeriodState((prev) => {
      const merged = typeof next === "function" ? next(prev) : next;
      writePeriod(merged);
      return merged;
    });
  }, []);

  const addItem = useCallback((space) => {
    const detailLine =
      typeof space.venue_zone === "string" && space.venue_zone.trim() !== ""
        ? space.venue_zone.trim()
        : typeof space.location_description === "string" && space.location_description.trim() !== ""
          ? space.location_description.trim()
          : typeof space.type === "string"
            ? space.type
            : "";
    const centerName =
      typeof space.shopping_center_name === "string" ? space.shopping_center_name.trim() : "";
    setItems((prev) => {
      const base = prev.length ? prev : readStorage();
      const next = base
        .filter((x) => x.id !== space.id)
        .concat([
          {
            id: space.id,
            code: space.code,
            title: space.title,
            monthly_price_usd: String(space.monthly_price_usd),
            ...(centerName ? { shopping_center_name: centerName } : {}),
            ...(detailLine ? { detail_line: detailLine } : {}),
          },
        ]);
      writeStorage(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    writeStorage([]);
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      rentalPeriod,
      setRentalPeriod,
      addItem,
      removeItem,
      clear,
    }),
    [items, rentalPeriod, setRentalPeriod, addItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

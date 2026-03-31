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

const STORAGE_KEY = "sambil-marketplace-cart";
const PERIOD_KEY = "sambil-marketplace-rental";

const CartContext = createContext(null);

function readStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return sanitizeCartItems(arr);
  } catch {
    return [];
  }
}

function writeStorage(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeCartItems(items)));
}

function readPeriod() {
  if (typeof window === "undefined") return defaultRentalPeriod();
  try {
    const raw = localStorage.getItem(PERIOD_KEY);
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
  localStorage.setItem(PERIOD_KEY, JSON.stringify(p));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [rentalPeriod, setRentalPeriodState] = useState(defaultRentalPeriod);

  useEffect(() => {
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

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

/** Período global antiguo: se copia a cada línea sin fechas y luego se deja de usar. */
function readLegacyPeriod() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(periodStorageKey());
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p?.start_date && p?.end_date) return p;
  } catch {
    /* fallthrough */
  }
  return null;
}

function migrateItemsWithLegacyPeriod(items, legacy) {
  const fallback = legacy?.start_date && legacy?.end_date ? legacy : defaultRentalPeriod();
  return items.map((i) => {
    if (typeof i.start_date === "string" && typeof i.end_date === "string") return i;
    return {
      ...i,
      start_date: fallback.start_date,
      end_date: fallback.end_date,
    };
  });
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    clearLegacyCartKeys();
    const legacy = readLegacyPeriod();
    let loaded = readStorage();
    const migrated = migrateItemsWithLegacyPeriod(loaded, legacy);
    if (JSON.stringify(migrated) !== JSON.stringify(loaded)) {
      writeStorage(migrated);
    }
    try {
      localStorage.removeItem(periodStorageKey());
    } catch {
      /* ignore */
    }
    setItems(migrated);
  }, []);

  const addItem = useCallback((space, range) => {
    if (!range?.start_date || !range?.end_date) return;
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
            start_date: range.start_date,
            end_date: range.end_date,
            ...(centerName ? { shopping_center_name: centerName } : {}),
            ...(detailLine ? { detail_line: detailLine } : {}),
          },
        ]);
      writeStorage(next);
      return next;
    });
  }, []);

  const updateItemDates = useCallback((id, range) => {
    if (!range?.start_date || !range?.end_date) return;
    setItems((prev) => {
      const next = prev.map((x) =>
        x.id === id ? { ...x, start_date: range.start_date, end_date: range.end_date } : x,
      );
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
      addItem,
      updateItemDates,
      removeItem,
      clear,
    }),
    [items, addItem, updateItemDates, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

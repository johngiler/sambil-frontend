"use client";

import { mutate } from "swr";

/**
 * Revalida todas las entradas SWR (p. ej. tras login, logout o cambio de tenant).
 * @returns {Promise<unknown>}
 */
export function invalidateAllSwrCache() {
  return mutate(() => true, undefined, { revalidate: true });
}

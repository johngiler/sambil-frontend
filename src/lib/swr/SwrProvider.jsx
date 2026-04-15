"use client";

import { SWRConfig } from "swr";

import { authJsonFetcher } from "@/lib/swr/fetchers";

/**
 * Valores por defecto globales (hooks que pasan `null` como clave no hacen fetch).
 *
 * No establecer `revalidateOnMount: false` en opciones por recurso: en SWR 2.x eso desactiva
 * la primera revalidación al montar y el dato puede no cargarse hasta foco/reconexión.
 * Para listados públicos del catálogo, ver `homeCatalogSwr.js`.
 */
export function SwrProvider({ children }) {
  return (
    <SWRConfig
      value={{
        fetcher: authJsonFetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 3000,
        errorRetryCount: 2,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}

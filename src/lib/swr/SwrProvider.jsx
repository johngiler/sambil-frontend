"use client";

import { SWRConfig } from "swr";

import { authJsonFetcher } from "@/lib/swr/fetchers";

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

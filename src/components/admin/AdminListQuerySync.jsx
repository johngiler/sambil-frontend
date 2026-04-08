"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function AdminListQuerySyncInner({ onQuery }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const raw = searchParams.get("q");
    if (raw != null && raw !== "") {
      onQuery(raw);
    }
  }, [searchParams, onQuery]);
  return null;
}

/** Aplica `?q=` de la URL al campo de búsqueda del listado (enlaces desde otras secciones del panel). */
export function AdminListQuerySync({ onQuery }) {
  return (
    <Suspense fallback={null}>
      <AdminListQuerySyncInner onQuery={onQuery} />
    </Suspense>
  );
}

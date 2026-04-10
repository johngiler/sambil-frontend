import { Suspense } from "react";

import MisPedidosView from "@/views/MisPedidosView";

export default function MisPedidosPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-12 text-center text-sm text-zinc-500">Cargando…</div>
      }
    >
      <MisPedidosView />
    </Suspense>
  );
}

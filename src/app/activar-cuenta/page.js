import { Suspense } from "react";

import ActivarCuentaForm from "@/components/auth/ActivarCuentaForm";

function Fallback() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center text-zinc-500">Cargando…</div>
  );
}

export default function ActivarCuentaPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <ActivarCuentaForm />
    </Suspense>
  );
}

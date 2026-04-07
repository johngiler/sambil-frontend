import { Suspense } from "react";

import RegistroContraseñaForm from "@/components/auth/RegistroContraseñaForm";

function Fallback() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center text-zinc-500">Cargando…</div>
  );
}

export default function RegistroContraseñaPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <RegistroContraseñaForm />
    </Suspense>
  );
}

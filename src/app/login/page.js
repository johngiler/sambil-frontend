import { Suspense } from "react";

import LoginForm from "@/components/auth/LoginForm";

function Fallback() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center text-zinc-500">Cargando…</div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <LoginForm />
    </Suspense>
  );
}

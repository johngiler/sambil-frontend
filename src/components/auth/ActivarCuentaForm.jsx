"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  PasswordPairLiveValidation,
  PASSWORD_PAIR_MIN_LENGTH,
} from "@/components/checkout/PasswordPairLiveValidation";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import {
  formatPasswordPolicyErrorBody,
  postActivateClientAccount,
  postValidatePassword,
} from "@/services/api";

function formatErr(raw) {
  if (raw == null || raw === "") return "No se pudo completar la activación.";
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (typeof o?.detail === "string") return o.detail;
    if (Array.isArray(o?.detail)) return o.detail.map(String).join(" ");
  } catch {
    /* fallthrough */
  }
  return typeof raw === "string" ? raw : "No se pudo completar la activación.";
}

export default function ActivarCuentaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => (searchParams.get("token") || "").trim(), [searchParams]);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [policyError, setPolicyError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setPolicyError("");
  }, [password, passwordConfirm]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPolicyError("");
    if (!token) {
      setError("El enlace no es válido o falta el token. Abre el enlace completo del correo.");
      return;
    }
    if (password.length < PASSWORD_PAIR_MIN_LENGTH) {
      setPolicyError(`La contraseña debe tener al menos ${PASSWORD_PAIR_MIN_LENGTH} caracteres.`);
      return;
    }
    if (password !== passwordConfirm) {
      setPolicyError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await postValidatePassword(password);
    } catch (err) {
      setPolicyError(
        err instanceof Error ? err.message : "La contraseña no cumple las reglas de seguridad.",
      );
      setLoading(false);
      return;
    }
    try {
      await postActivateClientAccount({ token, password });
      setDone(true);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      let parsed = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        parsed = null;
      }
      if (parsed && typeof parsed === "object" && parsed.password != null) {
        setPolicyError(formatPasswordPolicyErrorBody(parsed));
      } else {
        setError(raw ? formatErr(raw) : "Error al activar");
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Cuenta lista</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600">
          Ya puedes iniciar sesión con el correo de tu empresa y la contraseña que acabas de definir.
        </p>
        <Link
          href="/login"
          className={`mt-8 inline-flex min-h-11 w-full items-center justify-center ${ROUNDED_CONTROL} bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800`}
        >
          Ir al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Activar tu cuenta</h1>
      <p className="mt-3 text-sm text-zinc-600">
        Define una contraseña para acceder al marketplace con el correo de tu empresa.
      </p>
      {!token ? (
        <p className={`mt-6 ${ROUNDED_CONTROL} border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950`}>
          Falta el enlace de activación. Si copiaste la URL, asegúrate de incluir todo lo que viene después de{" "}
          <span className="font-mono text-xs">token=</span>.
        </p>
      ) : null}
      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <PasswordPairLiveValidation
          password={password}
          passwordConfirm={passwordConfirm}
          onPasswordChange={setPassword}
          onPasswordConfirmChange={setPasswordConfirm}
          passwordId="activate-password"
          confirmId="activate-password2"
          policyError={policyError}
        />
        {error ? (
          <p className={`break-words ${ROUNDED_CONTROL} bg-red-50 px-3 py-2 text-sm text-red-800`}>{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={loading || !token}
          className={`min-h-11 w-full ${ROUNDED_CONTROL} bg-[#d98e32] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c48a2b] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500`}
        >
          {loading ? "Guardando…" : "Activar cuenta"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-zinc-500">
        <button
          type="button"
          onClick={() => router.back()}
          className="font-medium text-zinc-700 underline-offset-4 hover:underline"
        >
          Volver
        </button>
        {" · "}
        <Link href="/login" className="font-medium text-zinc-700 underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}

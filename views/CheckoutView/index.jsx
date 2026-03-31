"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartProvider";
import { cartTotalUsd, contractMonthsInclusive } from "@/lib/rentalDates";
import { EmptyState, EmptyStateIconInbox } from "@/components/ui/EmptyState";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { authFetch, saveMyCompany } from "@/services/authApi";

function formatOrderErrorMessage(raw) {
  if (raw == null || raw === "") return "No se pudo crear la orden.";
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (o?.detail && typeof o.detail === "string") return o.detail;
    if (Array.isArray(o?.items)) {
      const parts = o.items
        .map((row, idx) => {
          if (!row || typeof row !== "object") return null;
          const ad = row.ad_space;
          if (Array.isArray(ad) && ad.length) {
            return `Línea ${idx + 1}: ${ad.join(" ")}`;
          }
          if (typeof ad === "string") return `Línea ${idx + 1}: ${ad}`;
          return null;
        })
        .filter(Boolean);
      if (parts.length) {
        return (
          parts.join(" ") +
          " Comprueba que las tomas existan en el catálogo publicado."
        );
      }
    }
  } catch {
    /* fallthrough */
  }
  return typeof raw === "string" ? raw : "No se pudo crear la orden.";
}

const fieldClass = `mt-1 min-h-11 w-full ${ROUNDED_CONTROL} border border-zinc-300 px-3 py-2.5 text-base text-zinc-900 transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#0c9dcf]/50 focus:outline-none focus:ring-2 focus:ring-[#0c9dcf]/20 sm:min-h-0 sm:py-2 sm:text-sm`;

export default function CheckoutView() {
  const router = useRouter();
  const { items, rentalPeriod, clear } = useCart();
  const {
    authReady,
    me,
    isAdmin,
    isClient,
    hasCompanyProfile,
    company,
    accessToken,
    setCompanyData,
  } = useAuth();

  const [company_name, setCompanyName] = useState("");
  const [rif, setRif] = useState("");
  const [contact_name, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const months = contractMonthsInclusive(rentalPeriod.start_date, rentalPeriod.end_date);
  const meetsMin = months >= 5;
  const total = meetsMin ? cartTotalUsd(items, rentalPeriod.start_date, rentalPeriod.end_date) : 0;

  useEffect(() => {
    if (company && typeof company === "object") {
      setCompanyName(company.company_name || "");
      setRif(company.rif || "");
      setContactName(company.contact_name || "");
      setEmail(company.email || "");
      setPhone(company.phone || "");
    } else if (me?.email) {
      setEmail(me.email);
    }
  }, [company, me]);

  async function ensureCompanyThenSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!items.length || !meetsMin) {
      setError("El carrito está vacío o el período no cumple 5 meses.");
      return;
    }
    if (!accessToken) return;

    setLoading(true);
    try {
      if (!hasCompanyProfile) {
        const payload = {
          company_name: company_name.trim(),
          rif: rif.trim(),
          contact_name: contact_name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        };
        const saved = await saveMyCompany(payload, {
          method: "POST",
          token: accessToken,
        });
        setCompanyData(saved);
      }

      const orderPayload = {
        items: items.map((i) => ({
          ad_space: i.id,
          start_date: rentalPeriod.start_date,
          end_date: rentalPeriod.end_date,
        })),
      };
      const draft = await authFetch("/api/orders/", {
        method: "POST",
        body: orderPayload,
        token: accessToken,
      });
      const submitted = await authFetch(`/api/orders/${draft.id}/submit/`, {
        method: "POST",
        body: {},
        token: accessToken,
      });
      setResult(submitted);
      clear();
    } catch (err) {
      setError(err instanceof Error ? formatOrderErrorMessage(err.message) : "Error al enviar");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Solicitud enviada</h1>
        <p className="mt-4 break-words text-zinc-600">
          Orden <span className="font-mono font-medium text-zinc-900">#{result.id}</span> — estado:{" "}
          <span className="capitalize">{result.status}</span>
        </p>
        {result.hold_expires_at ? (
          <p className="mt-2 break-words text-sm text-zinc-600">
            Reserva en revisión hasta{" "}
            {new Date(result.hold_expires_at).toLocaleString("es-VE", {
              dateStyle: "medium",
              timeStyle: "short",
            })}{" "}
            (72 h).
          </p>
        ) : null}
        <p className="mt-4 text-sm text-zinc-600">
          Monto total:{" "}
          <span className="font-semibold tabular-nums text-zinc-900">${result.total_amount} USD</span>
        </p>
        <Link
          href="/"
          className={`mt-8 inline-flex min-h-11 w-full items-center justify-center ${ROUNDED_CONTROL} bg-zinc-900 px-5 py-2.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-zinc-800 active:scale-[0.99] sm:w-auto sm:min-h-0 sm:text-sm`}
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-zinc-500">
        Cargando sesión…
      </div>
    );
  }

  if (!me) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Checkout</h1>
        <p className="mt-4 text-zinc-600">
          Para enviar una reserva necesitas usuario y contraseña que te facilite Sambil al dar de alta
          tu empresa. Luego puedes completar o revisar los datos de tu empresa aquí o en{" "}
          <strong>Mi empresa</strong>.
        </p>
        <div className="mt-8">
          <Link
            href="/login?next=/checkout"
            className={`inline-flex min-h-11 items-center justify-center ${ROUNDED_CONTROL} bg-zinc-900 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-zinc-800`}
          >
            Iniciar sesión
          </Link>
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          <Link href="/cart" className="font-medium text-zinc-800 underline-offset-4 hover:underline">
            Volver al carrito
          </Link>
        </p>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Checkout</h1>
        <p className="mt-4 text-zinc-600">
          El checkout del marketplace es para clientes. Como administrador, crea pedidos desde el{" "}
          <Link href="/dashboard" className="font-medium text-zinc-900 underline-offset-4 hover:underline">
            panel
          </Link>{" "}
          indicando el cliente.
        </p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-zinc-600">
        Tu rol no puede usar este flujo.{" "}
        <Link href="/" className="font-medium text-zinc-900 underline-offset-4 hover:underline">
          Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Checkout</h1>
      <p className="mt-2 break-words text-zinc-600">
        Confirma tu empresa y envía la solicitud (borrador → enviada con reserva 72 h).
      </p>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<EmptyStateIconInbox />}
            title="No hay nada que confirmar"
            description="El carrito no tiene tomas con período válido. Vuelve al carrito para añadir espacios y fechas."
            action={
              <Link
                href="/cart"
                className={`inline-flex min-h-11 items-center justify-center ${ROUNDED_CONTROL} bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 sm:min-h-0`}
              >
                Ir al carrito
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className={`mt-8 break-words ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 sm:p-5`}>
            <p className="font-medium text-zinc-900">Resumen</p>
            <ul className="mt-2 space-y-1">
              {items.map((i) => (
                <li key={i.id} className="break-words">
                  {i.code} — ${i.monthly_price_usd}/mes × {months} meses
                </li>
              ))}
            </ul>
            <p className="mt-3 font-semibold text-zinc-900">
              Total estimado: <span className="tabular-nums">${total.toFixed(2)} USD</span>
              <span className="mt-1 block text-sm font-normal text-zinc-600">
                El importe definitivo se confirma al enviar la solicitud.
              </span>
            </p>
            <p className="mt-1 break-all text-xs text-zinc-500">
              Período: {rentalPeriod.start_date} → {rentalPeriod.end_date}
            </p>
          </div>

          {!hasCompanyProfile ? (
            <div className={`mt-6 ${ROUNDED_CONTROL} border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950`}>
              <p className="font-medium">Completa los datos de tu empresa</p>
              <p className="mt-1 text-amber-900/90">
                Son obligatorios para generar la orden. También puedes cargarlos antes en{" "}
                <Link href="/cuenta" className="font-semibold underline-offset-4 hover:underline">
                  Mi empresa
                </Link>
                .
              </p>
            </div>
          ) : null}

          <form onSubmit={ensureCompanyThenSubmit} className="mt-8 space-y-4">
            {!hasCompanyProfile ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Razón social</label>
                  <input
                    required
                    value={company_name}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">RIF</label>
                  <input
                    required
                    value={rif}
                    onChange={(e) => setRif(e.target.value)}
                    className={fieldClass}
                    placeholder="J-12345678-9"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Persona de contacto</label>
                  <input
                    value={contact_name}
                    onChange={(e) => setContactName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClass}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Teléfono</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={fieldClass}
                    type="tel"
                    autoComplete="tel"
                  />
                </div>
              </>
            ) : (
              <div className={`${ROUNDED_CONTROL} border border-zinc-200 bg-white p-4 text-sm text-zinc-700`}>
                <p className="font-medium text-zinc-900">Empresa</p>
                <p className="mt-1">{company.company_name}</p>
                <p className="text-zinc-600">RIF {company.rif}</p>
                <button
                  type="button"
                  onClick={() => router.push("/cuenta")}
                  className="mt-3 text-sm font-medium text-[#0c9dcf] underline-offset-4 hover:underline"
                >
                  Editar en Mi empresa
                </button>
              </div>
            )}

            {error ? (
              <p className={`break-words ${ROUNDED_CONTROL} bg-red-50 px-3 py-2 text-sm text-red-800`}>{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading || !meetsMin}
              className={`min-h-11 w-full ${ROUNDED_CONTROL} bg-zinc-900 px-5 py-2.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-zinc-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-400 sm:w-auto sm:min-h-0 sm:text-sm`}
            >
              {loading ? "Enviando…" : hasCompanyProfile ? "Enviar solicitud" : "Guardar empresa y enviar"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

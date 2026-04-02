"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartProvider";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  formatUsdInteger,
  formatUsdMoney,
  ivaFromSubtotal,
  totalWithIva,
} from "@/lib/marketplacePricing";
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

const fieldClass = `mt-1.5 min-h-11 w-full ${ROUNDED_CONTROL} border border-zinc-200 bg-white px-3 py-2.5 text-base text-zinc-900 transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#d98e32]/60 focus:outline-none focus:ring-2 focus:ring-[#d98e32]/20 sm:min-h-0 sm:py-2 sm:text-sm`;

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400";

const PAYMENT_METHODS = [
  { id: "card", label: "Tarjeta" },
  { id: "transfer", label: "Transferencia" },
  { id: "crypto", label: "Cripto" },
  { id: "zelle", label: "Zelle" },
];

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
  const { displayName } = useWorkspace();

  const [step, setStep] = useState("datos");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [company_name, setCompanyName] = useState("");
  const [rif, setRif] = useState("");
  const [contact_name, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Venezuela");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const months = contractMonthsInclusive(rentalPeriod.start_date, rentalPeriod.end_date);
  const meetsMin = months >= 5;
  const subtotal = meetsMin ? cartTotalUsd(items, rentalPeriod.start_date, rentalPeriod.end_date) : 0;
  const iva = ivaFromSubtotal(subtotal);
  const grandTotal = totalWithIva(subtotal);

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

  const datosComplete =
    hasCompanyProfile ||
    (company_name.trim() && rif.trim() && email.trim() && contact_name.trim() && phone.trim());

  async function ensureCompanyThenSubmit() {
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
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
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
          <span className="font-semibold tabular-nums text-[#d98e32]">
            {formatUsdMoney(Number(result.total_amount))}
          </span>
        </p>
        <Link
          href="/"
          className={`mt-8 inline-flex min-h-11 w-full items-center justify-center ${ROUNDED_CONTROL} bg-zinc-900 px-5 py-2.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-zinc-800 active:scale-[0.99] sm:min-h-0 sm:text-sm`}
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-zinc-500">
        Cargando sesión…
      </div>
    );
  }

  if (!me) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Checkout</h1>
        <p className="mt-4 text-zinc-600">
          Para enviar una reserva necesitas usuario y contraseña que te facilite {displayName} al dar de alta
          tu empresa.
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
            ← Volver al carrito
          </Link>
        </p>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Checkout</h1>
        <p className="mt-4 text-zinc-600">
          El checkout del marketplace es para clientes. Como administrador, crea pedidos desde el{" "}
          <Link href="/dashboard" className="font-medium text-zinc-900 underline-offset-4 hover:underline">
            panel
          </Link>
          .
        </p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 text-zinc-600">
        Tu rol no puede usar este flujo.{" "}
        <Link href="/" className="font-medium text-zinc-900 underline-offset-4 hover:underline">
          Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-sm text-zinc-500">
        <Link href="/cart" className="font-medium text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline">
          ← Volver al carrito
        </Link>
      </p>
      <h1 className="mt-4 text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Checkout</h1>

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
          <CheckoutStepper step={step} />

          {step === "datos" ? (
            <div className="mt-10 space-y-6">
              {!hasCompanyProfile ? (
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (datosComplete) setStep("pago");
                  }}
                >
                  <div>
                    <label className={labelClass}>Empresa</label>
                    <input
                      required
                      value={company_name}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Contacto</label>
                    <input
                      required
                      value={contact_name}
                      onChange={(e) => setContactName(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
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
                    <label className={labelClass}>Teléfono</label>
                    <input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={fieldClass}
                      type="tel"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>RIF</label>
                    <input
                      required
                      value={rif}
                      onChange={(e) => setRif(e.target.value)}
                      className={fieldClass}
                      placeholder="J-12345678-9"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>País</label>
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!datosComplete}
                    className={`mt-2 min-h-11 w-full ${ROUNDED_CONTROL} px-5 py-3 text-sm font-semibold transition-colors ${
                      datosComplete
                        ? "bg-zinc-500 text-white hover:bg-zinc-600"
                        : "cursor-not-allowed bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    Continuar
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className={`${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50/80 p-5`}>
                    <p className={labelClass}>Empresa registrada</p>
                    <p className="mt-2 text-base font-semibold text-zinc-900">{company.company_name}</p>
                    <p className="mt-1 text-sm text-zinc-600">RIF {company.rif}</p>
                    <button
                      type="button"
                      onClick={() => router.push("/cuenta")}
                      className="mt-4 text-sm font-semibold text-[#d98e32] underline-offset-4 hover:underline"
                    >
                      Editar en Mi empresa
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("pago")}
                    className={`min-h-11 w-full ${ROUNDED_CONTROL} bg-zinc-500 py-3 text-sm font-semibold text-white hover:bg-zinc-600`}
                  >
                    Continuar
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {step === "pago" ? (
            <div className="mt-10 space-y-8">
              <p className="text-sm text-zinc-600">
                Elige un método de pago de referencia (la facturación real la confirma el equipo de {displayName}).
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((m) => {
                  const on = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`min-h-[3.25rem] rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                        on
                          ? "border-[#d98e32] bg-orange-50/90 text-[#b45309] ring-1 ring-[#d98e32]/30"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("datos")}
                  className={`min-h-11 flex-1 ${ROUNDED_CONTROL} border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50`}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep("confirmar")}
                  className={`min-h-11 flex-1 ${ROUNDED_CONTROL} bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800`}
                >
                  Revisar
                </button>
              </div>
            </div>
          ) : null}

          {step === "confirmar" ? (
            <div className="mt-10 space-y-8">
              <div className={`${ROUNDED_CONTROL} border border-zinc-200 bg-white p-5 shadow-sm`}>
                <ul className="divide-y divide-zinc-100">
                  {items.map((i) => {
                    const line = cartTotalUsd([i], rentalPeriod.start_date, rentalPeriod.end_date);
                    return (
                      <li key={i.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                        <span className="font-medium text-zinc-900">{i.title}</span>
                        <span className="shrink-0 tabular-nums text-lg font-bold text-[#d98e32]">
                          {formatUsdInteger(line)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 border-t border-zinc-200 pt-4">
                  <div className="flex justify-between text-sm text-zinc-600">
                    <span>Total c/ IVA</span>
                    <span className="text-lg font-bold tabular-nums text-[#d98e32]">
                      {formatUsdInteger(grandTotal)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Subtotal {formatUsdMoney(subtotal)} + IVA (16 %) {formatUsdMoney(iva)}
                  </p>
                </div>
              </div>

              {error ? (
                <p className={`break-words ${ROUNDED_CONTROL} bg-red-50 px-3 py-2 text-sm text-red-800`}>
                  {error}
                </p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("pago")}
                  className={`min-h-11 flex-1 ${ROUNDED_CONTROL} border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50`}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  disabled={loading || !meetsMin}
                  onClick={() => ensureCompanyThenSubmit()}
                  className={`min-h-11 flex-1 ${ROUNDED_CONTROL} bg-[#d98e32] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c48a2b] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500`}
                >
                  {loading ? "Enviando…" : "Confirmar pago"}
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

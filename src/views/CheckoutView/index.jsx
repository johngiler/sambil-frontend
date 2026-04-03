"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import {
  PasswordPairLiveValidation,
  PASSWORD_PAIR_MIN_LENGTH,
} from "@/components/checkout/PasswordPairLiveValidation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartProvider";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  formatUsdInteger,
  formatUsdMoney,
  ivaFromSubtotal,
  totalWithIva,
} from "@/lib/marketplacePricing";
import { cartAllItemsMeetCheckoutRules, cartTotalUsd } from "@/lib/rentalDates";
import { EmptyState, EmptyStateIconInbox } from "@/components/ui/EmptyState";
import {
  marketplacePrimaryBtn,
  marketplaceSecondaryBtn,
} from "@/lib/marketplaceActionButtons";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import {
  postGuestCheckout,
  postGuestCheckoutEmailAvailable,
  postValidatePassword,
} from "@/services/api";
import { authFetch, saveMyCompany } from "@/services/authApi";

function formatOrderErrorMessage(raw) {
  if (raw == null || raw === "") return "No se pudo crear el pedido.";
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (o && typeof o === "object" && o.password != null) {
      const p = o.password;
      if (Array.isArray(p)) return p.map(String).filter(Boolean).join(" ");
      if (typeof p === "string" && p.trim()) return p.trim();
    }
    if (o?.detail) {
      if (typeof o.detail === "string") return o.detail;
      if (Array.isArray(o.detail)) return o.detail.map(String).join(" ");
    }
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
  return typeof raw === "string" ? raw : "No se pudo crear el pedido.";
}

const fieldClass = `mp-form-field-accent mt-1.5 min-h-11 w-full ${ROUNDED_CONTROL} border border-zinc-200 bg-white px-3 py-2.5 text-base text-zinc-900 transition-[border-color,box-shadow] duration-200 ease-out focus:outline-none sm:min-h-0 sm:py-2 sm:text-sm`;

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400";

const PAYMENT_METHODS = [
  { id: "card", label: "Tarjeta" },
  { id: "transfer", label: "Transferencia" },
  { id: "crypto", label: "Cripto" },
  { id: "zelle", label: "Zelle" },
];

export default function CheckoutView() {
  const router = useRouter();
  const { items, clear } = useCart();
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

  const isGuest = !me;

  const [step, setStep] = useState("datos");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [company_name, setCompanyName] = useState("");
  const [rif, setRif] = useState("");
  const [contact_name, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Venezuela");
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [guestCreatedAccount, setGuestCreatedAccount] = useState(false);
  /** true solo si la orden se envió vía checkout invitado (no sesión cliente). */
  const [completedAsGuest, setCompletedAsGuest] = useState(false);
  const [guestPasswordPolicyError, setGuestPasswordPolicyError] = useState("");
  const [guestEmailTakenError, setGuestEmailTakenError] = useState("");
  const [guestDatosPasswordChecking, setGuestDatosPasswordChecking] = useState(false);

  const meetsMin = cartAllItemsMeetCheckoutRules(items);
  const subtotal = meetsMin ? cartTotalUsd(items) : 0;
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

  useEffect(() => {
    setGuestPasswordPolicyError("");
  }, [password, passwordConfirm, createAccount]);

  useEffect(() => {
    setGuestEmailTakenError("");
  }, [email, createAccount]);

  const baseFieldsOk =
    Boolean(company_name.trim()) &&
    Boolean(rif.trim()) &&
    Boolean(email.trim()) &&
    Boolean(contact_name.trim()) &&
    Boolean(phone.trim());

  const passwordBlockOk =
    !createAccount ||
    (password.length >= PASSWORD_PAIR_MIN_LENGTH &&
      password === passwordConfirm &&
      passwordConfirm.length >= PASSWORD_PAIR_MIN_LENGTH);

  const guestDatosReady = isGuest && baseFieldsOk && passwordBlockOk;

  const clientNewCompanyReady = !isGuest && !hasCompanyProfile && baseFieldsOk;

  const datosStepCanContinue = isGuest
    ? guestDatosReady
    : hasCompanyProfile || clientNewCompanyReady;

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
          start_date: i.start_date,
          end_date: i.end_date,
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
      setGuestCreatedAccount(false);
      setCompletedAsGuest(false);
      clear();
    } catch (err) {
      setError(err instanceof Error ? formatOrderErrorMessage(err.message) : "Error al enviar");
    } finally {
      setLoading(false);
    }
  }

  async function guestSubmit() {
    setError("");
    setResult(null);
    if (!items.length || !meetsMin) {
      setError("El carrito está vacío o el período no cumple 5 meses.");
      return;
    }
    if (!guestDatosReady) {
      setError(
        `Completa los datos y, si marcaste crear cuenta, la contraseña (mínimo ${PASSWORD_PAIR_MIN_LENGTH} caracteres).`,
      );
      return;
    }

    setLoading(true);
    try {
      const submitted = await postGuestCheckout({
        company_name: company_name.trim(),
        rif: rif.trim(),
        contact_name: contact_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: "",
        city: "",
        create_account: createAccount,
        password: createAccount ? password : "",
        password_confirm: createAccount ? passwordConfirm : "",
        items: items.map((i) => ({
          ad_space: i.id,
          start_date: i.start_date,
          end_date: i.end_date,
        })),
      });
      setResult(submitted);
      setGuestCreatedAccount(createAccount);
      setCompletedAsGuest(true);
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
          Pedido <span className="font-mono font-medium text-zinc-900">#{result.id}</span> — estado:{" "}
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
          <span className="mp-text-brand font-semibold tabular-nums">
            {formatUsdMoney(Number(result.total_amount))}
          </span>
        </p>
        {guestCreatedAccount ? (
          <p className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
            Creaste tu cuenta con este pedido. Ya puedes{" "}
            <Link href="/login" className="font-semibold underline-offset-4 hover:underline">
              iniciar sesión
            </Link>{" "}
            con tu correo y contraseña para ver el estado en &quot;Mis pedidos&quot;.
          </p>
        ) : null}
        {completedAsGuest && !guestCreatedAccount ? (
          <p className="mt-4 text-sm leading-relaxed text-zinc-600">
            Compraste <strong className="font-medium text-zinc-800">sin crear cuenta</strong>. Cuando el equipo de{" "}
            {displayName} apruebe la solicitud recibirás un correo en{" "}
            <span className="font-medium text-zinc-800">{email || "tu correo"}</span> con un enlace para definir tu
            contraseña y acceder con ese mismo correo.
          </p>
        ) : null}
        {!completedAsGuest ? (
          <p className="mt-4 text-sm text-zinc-600">
            Revisa el estado en{" "}
            <Link href="/cuenta/pedidos" className="font-semibold text-zinc-900 underline-offset-4 hover:underline">
              Mis pedidos
            </Link>
            .
          </p>
        ) : null}
        {completedAsGuest && !guestCreatedAccount ? (
          <p className="mt-2 text-xs text-zinc-500">
            El seguimiento comercial puede continuar en tu CRM; aquí queda registrada la solicitud en el marketplace.
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className={`${marketplaceSecondaryBtn} min-h-11 flex-1 px-5 py-2.5 text-base font-semibold sm:min-h-0 sm:text-sm`}
          >
            Volver al inicio
          </Link>
          {guestCreatedAccount ? (
            <Link
              href="/login"
              className={`${marketplacePrimaryBtn} min-h-11 flex-1 px-5 py-2.5 text-base font-semibold sm:min-h-0 sm:text-sm`}
            >
              Iniciar sesión
            </Link>
          ) : completedAsGuest ? null : (
            <Link
              href="/cuenta/pedidos"
              className={`${marketplacePrimaryBtn} min-h-11 flex-1 px-5 py-2.5 text-base font-semibold sm:min-h-0 sm:text-sm`}
            >
              Ver mis pedidos
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-zinc-500">
        Cargando…
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-balance text-2xl font-bold text-zinc-900 sm:text-3xl">Checkout</h1>
        <p className="mt-4 text-zinc-600">
          Este proceso no está disponible para tu cuenta.{" "}
          <Link href="/" className="font-medium text-zinc-900 underline-offset-4 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    );
  }

  if (me && !isClient) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 text-zinc-600">
        Este proceso no está disponible para tu cuenta.{" "}
        <Link href="/" className="font-medium text-zinc-900 underline-offset-4 hover:underline">
          Inicio
        </Link>
      </div>
    );
  }

  const canCheckout = isGuest || isClient;
  if (!canCheckout) {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-sm text-zinc-500">
        <Link href="/cart" className="font-medium text-zinc-900 underline-offset-4 hover:underline">
          ← Volver al carrito
        </Link>
      </p>
      {isGuest ? (
        <p className="mt-3 text-sm text-zinc-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login?next=/checkout" className="font-semibold text-zinc-900 underline-offset-4 hover:underline">
            Inicia sesión
          </Link>
        </p>
      ) : null}
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
                className={`${marketplacePrimaryBtn} min-h-11 px-5 py-2.5 text-sm font-semibold sm:min-h-0`}
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
              {isGuest ? (
                <form
                  className="space-y-5"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!datosStepCanContinue) return;
                    if (createAccount) {
                      setGuestPasswordPolicyError("");
                      setGuestEmailTakenError("");
                      setGuestDatosPasswordChecking(true);
                      try {
                        await postValidatePassword(password);
                      } catch (err) {
                        setGuestPasswordPolicyError(
                          err instanceof Error ? err.message : "La contraseña no cumple las reglas de seguridad.",
                        );
                        setGuestDatosPasswordChecking(false);
                        return;
                      }
                      try {
                        const emailCheck = await postGuestCheckoutEmailAvailable(email.trim());
                        if (!emailCheck.available) {
                          setGuestEmailTakenError(
                            typeof emailCheck.detail === "string" && emailCheck.detail.trim()
                              ? emailCheck.detail.trim()
                              : "Ya existe un usuario con este correo. Inicia sesión o usa otro email.",
                          );
                          setGuestDatosPasswordChecking(false);
                          return;
                        }
                      } catch (err) {
                        setGuestEmailTakenError(
                          err instanceof Error
                            ? err.message
                            : "No se pudo comprobar el correo. Intenta de nuevo.",
                        );
                        setGuestDatosPasswordChecking(false);
                        return;
                      }
                      setGuestDatosPasswordChecking(false);
                    }
                    setStep("pago");
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
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-zinc-300 accent-[color:var(--mp-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--mp-primary)_30%,transparent)]"
                    />
                    <span className="text-sm leading-snug text-zinc-700">
                      <span className="font-semibold text-zinc-900">Crear cuenta al comprar</span>
                      <span className="mt-0.5 block text-xs text-zinc-500">
                        Contraseña de al menos {PASSWORD_PAIR_MIN_LENGTH} caracteres; mismo correo que arriba para
                        iniciar sesión después.
                      </span>
                    </span>
                  </label>
                  {createAccount ? (
                    <PasswordPairLiveValidation
                      password={password}
                      passwordConfirm={passwordConfirm}
                      onPasswordChange={setPassword}
                      onPasswordConfirmChange={setPasswordConfirm}
                      passwordId="guest-checkout-password"
                      confirmId="guest-checkout-password-confirm"
                      policyError={guestPasswordPolicyError}
                    />
                  ) : null}
                  {guestEmailTakenError ? (
                    <p
                      role="alert"
                      className={`break-words ${ROUNDED_CONTROL} bg-red-50 px-3 py-2 text-sm text-red-800`}
                    >
                      {guestEmailTakenError}{" "}
                      <Link
                        href="/login?next=/checkout"
                        className="font-semibold text-red-900 underline-offset-2 hover:underline"
                      >
                        Iniciar sesión
                      </Link>
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={!datosStepCanContinue || guestDatosPasswordChecking}
                    className={`${marketplacePrimaryBtn} mt-2 min-h-11 w-full px-5 py-3 text-sm font-semibold`}
                  >
                    {guestDatosPasswordChecking ? "Comprobando…" : "Continuar"}
                  </button>
                </form>
              ) : !hasCompanyProfile ? (
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (datosStepCanContinue) setStep("pago");
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
                    disabled={!datosStepCanContinue}
                    className={`${marketplacePrimaryBtn} mt-2 min-h-11 w-full px-5 py-3 text-sm font-semibold`}
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
                      className="mp-text-brand mt-4 text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      Editar en Mi empresa
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("pago")}
                    className={`${marketplacePrimaryBtn} min-h-11 w-full py-3 text-sm font-semibold`}
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
                          ? "border-[color-mix(in_srgb,var(--mp-primary)_58%,#d4d4d8)] bg-[color-mix(in_srgb,var(--mp-primary)_12%,#fff)] mp-text-brand ring-1 ring-[color-mix(in_srgb,var(--mp-primary)_22%,transparent)]"
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
                  className={`${marketplaceSecondaryBtn} min-h-11 flex-1 py-2.5 text-sm font-semibold`}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep("confirmar")}
                  className={`${marketplacePrimaryBtn} min-h-11 flex-1 py-2.5 text-sm font-semibold`}
                >
                  Continuar
                </button>
              </div>
            </div>
          ) : null}

          {step === "confirmar" ? (
            <div className="mt-10 space-y-8">
              <div className={`${ROUNDED_CONTROL} border border-zinc-200 bg-white p-5 shadow-sm`}>
                <ul className="divide-y divide-zinc-100">
                  {items.map((i) => {
                    const line = cartTotalUsd([i]);
                    return (
                      <li key={i.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                        <span className="font-medium text-zinc-900">{i.title}</span>
                        <span className="mp-text-brand shrink-0 text-lg font-bold tabular-nums">
                          {formatUsdInteger(line)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 border-t border-zinc-200 pt-4">
                  <div className="flex justify-between text-sm text-zinc-600">
                    <span>Total c/ IVA</span>
                    <span className="mp-text-brand text-lg font-bold tabular-nums">
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
                  className={`${marketplaceSecondaryBtn} min-h-11 flex-1 py-2.5 text-sm font-semibold`}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  disabled={loading || !meetsMin}
                  onClick={() => (isGuest ? guestSubmit() : ensureCompanyThenSubmit())}
                  className={`${marketplacePrimaryBtn} min-h-11 flex-1 py-2.5 text-sm font-semibold`}
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

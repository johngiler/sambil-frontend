"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { marketplacePrimaryBtn } from "@/lib/marketplaceActionButtons";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { saveMyCompany } from "@/services/authApi";

const fieldClass = `mp-form-field-accent mt-1.5 min-h-11 w-full ${ROUNDED_CONTROL} border border-zinc-200 bg-white px-3.5 py-2.5 text-base text-zinc-900 shadow-sm transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-zinc-400 focus:outline-none sm:min-h-0 sm:py-2 sm:text-sm`;

const roleBadgeClass =
  "inline-flex max-w-full shrink-0 items-center rounded-full border border-orange-200/90 bg-gradient-to-r from-orange-50/95 via-amber-50/80 to-white px-3 py-1 text-xs font-semibold text-orange-950 shadow-sm ring-1 ring-orange-100/70 sm:text-sm";

function marketplaceRoleLabel(role) {
  if (role === "admin") return "Administrador marketplace";
  if (role === "client") return "Cliente marketplace";
  return typeof role === "string" && role.trim() ? role : "";
}

function SectionTitle({ children, id }) {
  return (
    <h2
      id={id}
      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500"
    >
      <span
        className="h-px w-6 bg-gradient-to-r from-[color-mix(in_srgb,var(--mp-primary)_60%,transparent)] to-transparent"
        aria-hidden
      />
      {children}
    </h2>
  );
}

export default function CuentaView() {
  const router = useRouter();
  const { authReady, me, isAdmin, company, setCompanyData, accessToken, role } = useAuth();
  const [company_name, setCompanyName] = useState("");
  const [rif, setRif] = useState("");
  const [contact_name, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!me) {
      router.replace("/login?next=/cuenta");
      return;
    }
    if (isAdmin) {
      router.replace("/dashboard");
    }
  }, [authReady, me, isAdmin, router]);

  useEffect(() => {
    if (company && typeof company === "object") {
      setCompanyName(company.company_name || "");
      setRif(company.rif || "");
      setContactName(company.contact_name || "");
      setEmail(company.email || "");
      setPhone(company.phone || "");
      setAddress(company.address || "");
      setCity(company.city || "");
    }
  }, [company]);

  if (!authReady || !me || isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-zinc-500">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-[color:var(--mp-primary)]" />
        <p className="mt-4 text-sm">Cargando…</p>
      </div>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");
    setSaving(true);
    try {
      const payload = {
        company_name: company_name.trim(),
        rif: rif.trim(),
        contact_name: contact_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
      };
      const hasProfile = company && typeof company === "object";
      const data = await saveMyCompany(payload, {
        method: hasProfile ? "PATCH" : "POST",
        token: accessToken,
      });
      setCompanyData(data);
      setOk(hasProfile ? "Datos actualizados correctamente." : "Empresa registrada. Ya puedes usar el checkout.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const hasProfile = company && typeof company === "object";
  const profileRoleBadge = marketplaceRoleLabel(role);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <nav className="flex flex-wrap gap-2 text-sm" aria-label="Sección de cuenta">
        <Link
          href="/cuenta/perfil"
          className={`${ROUNDED_CONTROL} border border-zinc-200/90 bg-white px-3 py-1.5 font-medium text-zinc-700 shadow-sm transition hover:border-[color-mix(in_srgb,var(--mp-primary)_40%,transparent)] hover:text-[color:var(--mp-primary)]`}
        >
          Mi perfil
        </Link>
        <span
          className={`${ROUNDED_CONTROL} border border-[color-mix(in_srgb,var(--mp-primary)_45%,#d4d4d8)] bg-[color-mix(in_srgb,var(--mp-primary)_10%,color-mix(in_srgb,var(--mp-secondary)_5%,#fff))] px-3 py-1.5 text-sm font-semibold text-[color:var(--mp-primary)] ring-1 ring-[color-mix(in_srgb,var(--mp-primary)_18%,transparent)]`}
          aria-current="page"
        >
          Mi empresa
        </span>
      </nav>
      <p className="mt-3 text-xs text-zinc-500">
        En perfil puedes cambiar usuario, nombre y foto de perfil.
      </p>

      <div className="relative mt-8 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white px-5 py-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] sm:px-6 sm:py-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] mp-admin-filters-top-accent" aria-hidden />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-balance text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Mi empresa
          </h1>
          {profileRoleBadge ? (
            <span className={roleBadgeClass} aria-label={`Rol: ${profileRoleBadge}`}>
              {profileRoleBadge}
            </span>
          ) : null}
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
          Datos de tu <span className="font-medium text-zinc-800">empresa</span> para reservas en el marketplace.
          Son necesarios antes de enviar una solicitud desde el checkout.
        </p>
      </div>

      <div
        className={`mt-8 ${ROUNDED_CONTROL} border border-amber-200/80 bg-gradient-to-r from-amber-50/90 to-orange-50/40 px-4 py-3 text-sm text-amber-950 shadow-sm ring-1 ring-amber-100/60`}
      >
        <span className="font-semibold">Importante:</span> estos datos identifican a tu empresa en pedidos y
        facturación. Revísalos antes de confirmar reservas.
      </div>

      <form
        id="empresa"
        onSubmit={onSubmit}
        className={`relative mt-8 overflow-hidden ${ROUNDED_CONTROL} border border-zinc-200/90 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-zinc-100/80`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] mp-admin-filters-top-accent" aria-hidden />
        <div className="p-5 sm:p-6">
          <div className="space-y-8">
          <section aria-labelledby="sec-empresa">
            <SectionTitle id="sec-empresa">Empresa</SectionTitle>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="cuenta-razon" className="block text-sm font-medium text-zinc-800">
                  Razón social <span className="text-red-600">*</span>
                </label>
                <input
                  id="cuenta-razon"
                  required
                  autoComplete="organization"
                  className={fieldClass}
                  value={company_name}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="sm:max-w-md">
                <label htmlFor="cuenta-rif" className="block text-sm font-medium text-zinc-800">
                  RIF
                </label>
                <p className="mt-1 text-xs text-zinc-500">
                  Opcional si aún no lo tienes; complétalo aquí para facturación.
                </p>
                <input
                  id="cuenta-rif"
                  className={`mt-1.5 ${fieldClass}`}
                  value={rif}
                  onChange={(e) => setRif(e.target.value)}
                  placeholder="Ej. J-12345678-9"
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="sec-contacto">
            <SectionTitle id="sec-contacto">Contacto</SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="cuenta-contacto" className="block text-sm font-medium text-zinc-800">
                  Persona de contacto
                </label>
                <input
                  id="cuenta-contacto"
                  autoComplete="name"
                  className={fieldClass}
                  value={contact_name}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cuenta-email" className="block text-sm font-medium text-zinc-800">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="cuenta-email"
                  required
                  type="email"
                  autoComplete="email"
                  className={fieldClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cuenta-tel" className="block text-sm font-medium text-zinc-800">
                  Teléfono
                </label>
                <input
                  id="cuenta-tel"
                  type="tel"
                  autoComplete="tel"
                  className={fieldClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="sec-ubicacion">
            <SectionTitle id="sec-ubicacion">Ubicación</SectionTitle>
            <div className="mt-4 space-y-4">
              <div className="sm:max-w-md">
                <label htmlFor="cuenta-ciudad" className="block text-sm font-medium text-zinc-800">
                  Ciudad
                </label>
                <input
                  id="cuenta-ciudad"
                  autoComplete="address-level2"
                  className={fieldClass}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cuenta-dir" className="block text-sm font-medium text-zinc-800">
                  Dirección
                </label>
                <textarea
                  id="cuenta-dir"
                  autoComplete="street-address"
                  className={`${fieldClass} min-h-[5rem] resize-y py-3 sm:min-h-0`}
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </section>
          </div>

        {error ? (
          <p
            className={`mt-6 break-words ${ROUNDED_CONTROL} border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-800`}
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {ok ? (
          <p
            className={`mt-6 ${ROUNDED_CONTROL} border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900`}
            role="status"
          >
            {ok}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={saving}
            className={`${marketplacePrimaryBtn} min-h-11 px-6 py-2.5 text-base sm:min-h-0 sm:text-sm`}
          >
            {saving ? "Guardando…" : hasProfile ? "Guardar cambios" : "Crear ficha de empresa"}
          </button>
          <Link
            href="/"
            className="text-center text-sm font-medium text-zinc-600 underline-offset-4 transition hover:text-zinc-900 hover:underline sm:text-left"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
      </form>
    </div>
  );
}

"use client";

import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/**
 * Normativas, aviso de permiso municipal y empresas de montaje (datos del API en detalle de toma).
 */
export function SpaceMarketplaceCompliance({ space }) {
  const notice =
    typeof space?.municipal_permit_notice === "string" ? space.municipal_permit_notice.trim() : "";
  const regulations =
    typeof space?.advertising_regulations === "string" ? space.advertising_regulations.trim() : "";
  const providers = Array.isArray(space?.mounting_providers) ? space.mounting_providers : [];

  if (!notice && !regulations && providers.length === 0) {
    return null;
  }

  return (
    <section
      className={`mt-10 border-t border-zinc-200 pt-10 ${ROUNDED_CONTROL} border border-zinc-200/90 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-7`}
      aria-labelledby="space-compliance-heading"
    >
      <h2
        id="space-compliance-heading"
        className="text-lg font-semibold tracking-tight text-zinc-950"
      >
        Reserva y normativa
      </h2>

      {notice ? (
        <div
          className={`mt-4 ${ROUNDED_CONTROL} border border-sky-200/90 bg-sky-50/90 px-4 py-3 text-sm leading-relaxed text-sky-950`}
          role="status"
        >
          <p className="font-semibold text-sky-900">Permiso municipal</p>
          <p className="mt-1 whitespace-pre-wrap text-sky-950/95">{notice}</p>
        </div>
      ) : null}

      {regulations ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Normativas de uso
          </h3>
          <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">{regulations}</div>
        </div>
      ) : null}

      {providers.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Empresas autorizadas para el montaje
          </h3>
          <ul className="mt-3 space-y-3 text-sm">
            {providers.map((p) => (
              <li
                key={p.id}
                className={`${ROUNDED_CONTROL} border border-zinc-200/90 bg-zinc-50/60 px-4 py-3`}
              >
                <p className="font-semibold text-zinc-900">{p.company_name}</p>
                {p.contact_name ? <p className="mt-0.5 text-zinc-700">Contacto: {p.contact_name}</p> : null}
                {p.phone ? <p className="mt-0.5 text-zinc-600">Tel.: {p.phone}</p> : null}
                {p.email ? <p className="mt-0.5 text-zinc-600">{p.email}</p> : null}
                {p.rif ? <p className="mt-0.5 font-mono text-xs text-zinc-600">RIF {p.rif}</p> : null}
                {p.notes ? <p className="mt-2 text-xs leading-relaxed text-zinc-600">{p.notes}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

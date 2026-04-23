"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { marketplaceSecondaryBtn } from "@/lib/marketplaceActionButtons";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { drfNextToRelativePath, fetchMountingProvidersPage } from "@/services/api";

const NORMATIVA_COLLAPSE_MIN_CHARS = 360;
/** Debe coincidir con `MOUNTING_PROVIDERS_PAGE_SIZE` del backend. */
const MOUNTING_PROVIDERS_PAGE = 3;

function mountingProvidersNextPath(spaceId, page) {
  if (spaceId == null || spaceId === "") return null;
  const id = encodeURIComponent(String(spaceId));
  return `/api/catalog/spaces/${id}/mounting-providers/?page=${page}&page_size=${MOUNTING_PROVIDERS_PAGE}`;
}

/** Texto informativo por defecto cuando el API no envía `advertising_regulations`. */
const DEFAULT_ADVERTISING_REGULATIONS = `1. Uso del espacio
Las tomas publicitarias están destinadas exclusivamente a la exhibición de material gráfico aprobado por el centro comercial y, cuando aplique, por la autoridad municipal. No se permite alterar la estructura del soporte ni instalar elementos adicionales no autorizados.

2. Calidad y formato del arte
Los archivos y el material impreso deben respetar las dimensiones, resolución y colores indicados en la ficha de la toma. El centro puede solicitar ajustes si el arte no cumple legibilidad, contraste o normas de convivencia con el público.

3. Instalación y desmontaje
Solo pueden realizar montaje, revisión o desmontaje las empresas autorizadas por el centro para esta sede. El anunciante debe coordinar fechas con la empresa asignada y cumplir el horario y las vías de acceso que indique administración.

4. Seguridad y mantenimiento
Queda prohibido obstacuir salidas, rutas de evacuación o equipos de seguridad. Cualquier intervención que implique riesgo eléctrico o estructural requiere autorización previa por escrito del centro.

5. Vigencia y retiro
Al vencimiento del contrato, el material debe retirarse en el plazo acordado. Si no se retira, el centro podrá aplicar las políticas de retiro y almacenamiento definidas en el contrato o en la hoja de negociación.

6. Permisos
Cuando la ubicación o el tipo de soporte exija permiso municipal, el anunciante es responsable de iniciar y mantener al día el trámite, salvo que el contrato establezca lo contrario. La publicación en sitio puede quedar condicionada a la presentación del permiso vigente.`;

/**
 * @param {unknown} raw
 * @param {string | number | undefined} spaceId
 * @returns {{ count: number, next: string | null, results: Array<Record<string, unknown>> }}
 */
function normalizeMountingPayload(raw, spaceId) {
  if (!raw) return { count: 0, next: null, results: [] };
  if (Array.isArray(raw)) {
    const count = raw.length;
    const results = raw.slice(0, MOUNTING_PROVIDERS_PAGE);
    const next = count > MOUNTING_PROVIDERS_PAGE ? mountingProvidersNextPath(spaceId, 2) : null;
    return { count, next, results };
  }
  if (typeof raw === "object" && raw !== null && Array.isArray(raw.results)) {
    const o = /** @type {Record<string, unknown>} */ (raw);
    const count = typeof o.count === "number" ? o.count : raw.results.length;
    let next = typeof o.next === "string" && o.next.trim() ? o.next.trim() : null;
    let results = raw.results.slice();
    if (results.length > MOUNTING_PROVIDERS_PAGE) {
      results = results.slice(0, MOUNTING_PROVIDERS_PAGE);
    }
    if (count > MOUNTING_PROVIDERS_PAGE && !next) {
      next = mountingProvidersNextPath(spaceId, 2);
    }
    return { count, next, results };
  }
  return { count: 0, next: null, results: [] };
}

function nextPathForFetch(next) {
  if (!next) return null;
  const s = String(next).trim();
  if (!s) return null;
  return s.startsWith("http") ? drfNextToRelativePath(s) || s : s;
}

/**
 * Normativas, aviso de permiso municipal y empresas de montaje (detalle de toma).
 */
export function SpaceMarketplaceCompliance({ space }) {
  const [normativasExpanded, setNormativasExpanded] = useState(false);
  const [providerRows, setProviderRows] = useState(/** @type {Array<Record<string, unknown>>} */ ([]));
  const [providerNext, setProviderNext] = useState(/** @type {string | null} */ (null));
  const [providerTotal, setProviderTotal] = useState(0);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState("");

  const notice =
    typeof space?.municipal_permit_notice === "string" ? space.municipal_permit_notice.trim() : "";
  const regulationsFromApi =
    typeof space?.advertising_regulations === "string" ? space.advertising_regulations.trim() : "";
  const regulationsBody = regulationsFromApi || DEFAULT_ADVERTISING_REGULATIONS;
  const normativaLong = regulationsBody.length > NORMATIVA_COLLAPSE_MIN_CHARS;

  useEffect(() => {
    const m = normalizeMountingPayload(space?.mounting_providers, space?.id);
    setProviderRows(m.results);
    setProviderTotal(typeof m.count === "number" ? m.count : m.results.length);
    setProviderNext(nextPathForFetch(m.next));
    setProvidersError("");
  }, [space?.id, space?.mounting_providers]);

  const loadMoreProviders = useCallback(async () => {
    if (!providerNext || providersLoading) return;
    setProvidersLoading(true);
    setProvidersError("");
    try {
      const page = await fetchMountingProvidersPage(providerNext);
      setProviderRows((prev) => [...prev, ...page.results]);
      setProviderNext(nextPathForFetch(page.next));
    } catch (e) {
      setProvidersError(e instanceof Error ? e.message : "No se pudieron cargar más empresas.");
    } finally {
      setProvidersLoading(false);
    }
  }, [providerNext, providersLoading]);

  const hasMoreProviders = Boolean(providerNext);
  const remainingCount = useMemo(() => {
    const n = providerTotal - providerRows.length;
    return n > 0 ? n : 0;
  }, [providerTotal, providerRows.length]);

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
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        Uso de las tomas y empresas autorizadas para montaje en este centro.
      </p>

      {notice ? (
        <div
          className={`mt-5 ${ROUNDED_CONTROL} border border-sky-200/90 bg-sky-50/90 px-4 py-3 text-sm leading-relaxed text-sky-950`}
          role="status"
        >
          <p className="font-semibold text-sky-900">Permiso municipal</p>
          <p className="mt-1 whitespace-pre-wrap text-sky-950/95">{notice}</p>
        </div>
      ) : null}

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Normativas del uso de las tomas publicitarias
        </h3>
        <div className={normativaLong && !normativasExpanded ? "relative mt-2" : "mt-2"}>
          <div
            className={`max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 ${
              normativaLong && !normativasExpanded
                ? "max-h-[11rem] overflow-hidden sm:max-h-[13rem]"
                : ""
            }`}
          >
            {regulationsBody}
          </div>
          {normativaLong && !normativasExpanded ? (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/85 to-transparent"
              aria-hidden
            />
          ) : null}
        </div>
        {normativaLong ? (
          <div className="mt-3">
            <button
              type="button"
              className={`${marketplaceSecondaryBtn} min-h-10 px-4 py-2 text-sm font-semibold`}
              onClick={() => setNormativasExpanded((v) => !v)}
              aria-expanded={normativasExpanded}
            >
              {normativasExpanded ? "Mostrar menos" : "Mostrar más"}
            </button>
          </div>
        ) : null}
        {!regulationsFromApi ? (
          <p className="mt-3 text-xs text-zinc-500">
            Resumen orientativo; prevalece lo acordado por escrito con el centro.
          </p>
        ) : null}
      </div>

      {providerTotal > 0 ? (
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Empresas autorizadas para el montaje
          </h3>
          <ul className="mt-3 grid list-none grid-cols-1 gap-3 p-0 text-sm sm:grid-cols-3">
            {providerRows.map((p) => (
              <li
                key={p.id}
                className={`flex min-h-0 flex-col ${ROUNDED_CONTROL} border border-zinc-200/90 bg-zinc-50/60 px-3 py-3 sm:px-4`}
              >
                <p className="line-clamp-2 font-semibold text-zinc-900">{p.company_name}</p>
                {p.contact_name ? (
                  <p className="mt-1 line-clamp-1 text-xs text-zinc-700">Contacto: {p.contact_name}</p>
                ) : null}
                {p.phone ? <p className="mt-0.5 truncate text-xs text-zinc-600">Tel.: {p.phone}</p> : null}
                {p.email ? (
                  <p className="mt-0.5 truncate text-xs text-zinc-600" title={String(p.email)}>
                    {p.email}
                  </p>
                ) : null}
                {p.rif ? <p className="mt-0.5 font-mono text-[11px] text-zinc-600">RIF {p.rif}</p> : null}
                {p.notes ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-snug text-zinc-600">{p.notes}</p>
                ) : null}
              </li>
            ))}
          </ul>
          {providersError ? (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {providersError}
            </p>
          ) : null}
          {hasMoreProviders ? (
            <div className="mt-4">
              <button
                type="button"
                disabled={providersLoading}
                className={`${marketplaceSecondaryBtn} min-h-10 px-4 py-2 text-sm font-semibold disabled:cursor-wait disabled:opacity-60`}
                onClick={() => void loadMoreProviders()}
              >
                {providersLoading
                  ? "Cargando…"
                  : remainingCount > 0
                    ? `Mostrar más (${remainingCount})`
                    : "Mostrar más"}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Empresas autorizadas para el montaje
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            No hay empresas registradas en catálogo para esta sede. Consulta al centro comercial.
          </p>
        </div>
      )}
    </section>
  );
}

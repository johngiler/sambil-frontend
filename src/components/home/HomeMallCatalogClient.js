"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { HomeMallCatalogSkeleton } from "@/components/home/HomeMallCatalogSkeleton";
import { MallCard } from "@/components/mall/MallCard";
import { EmptyState, EmptyStateIconBuilding, EmptyStateIconSearchOff } from "@/components/ui/EmptyState";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { mapApiCentersToHomeMalls } from "@/lib/homeCenters";
import { AdminFilterClearButton, FilterClearAction } from "@/components/admin/AdminListFilters";
import { AdminListPagination } from "@/components/admin/AdminListPagination";
import { getCentersCatalogPage } from "@/services/api";

const STATUS = {
  all: "all",
  available: "available",
  soon: "soon",
};

const LOCATION = {
  all: "all",
  caracas: "caracas",
  other: "other",
};

const chipBase =
  "mp-ring-brand min-h-10 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-200 ease-out focus-visible:outline-none active:scale-[0.97] sm:min-h-0 sm:py-1.5";

const chipOff = "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50";

/* Igual que `panelBtn` en Header.js: gradiente isotipo (sin cyan al final). */
const chipOn =
  "border-white/40 bg-[linear-gradient(115deg,#2f246b_0%,#5f1d64_22%,#90215c_40%,#ea4822_58%,#e97a01_74%,#eeab23_88%,#d97706_100%)] text-white shadow-[0_2px_14px_rgba(47,36,107,0.35)] hover:border-white/55 hover:bg-[linear-gradient(115deg,#3a3585_0%,#6f2474_22%,#a0286c_40%,#ec5a30_58%,#f08912_74%,#f2bc32_88%,#c2410c_100%)] hover:shadow-[0_4px_18px_rgba(234,72,34,0.26)]";

export function HomeMallCatalogClient() {
  const [malls, setMalls] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [status, setStatus] = useState(STATUS.all);
  const [location, setLocation] = useState(LOCATION.all);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);

  const filtersActive = useMemo(
    () => status !== STATUS.all || location !== LOCATION.all || query.trim() !== "",
    [status, location, query],
  );

  const loadPage = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { results, count } = await getCentersCatalogPage({
        search: debouncedQuery,
        catalogStatus: status,
        location,
        page,
      });
      setMalls(mapApiCentersToHomeMalls(results));
      setTotalCount(count);
    } catch (e) {
      setMalls([]);
      setTotalCount(0);
      setLoadError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
      setDataReady(true);
    }
  }, [debouncedQuery, status, location, page]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, status, location]);

  function clearFilters() {
    setStatus(STATUS.all);
    setLocation(LOCATION.all);
    setQuery("");
    setPage(1);
  }

  if (!dataReady && loading && !loadError) {
    return <HomeMallCatalogSkeleton />;
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <label htmlFor="mall-search" className="sr-only">
              Buscar centro
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                aria-hidden
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </span>
              <input
                id="mall-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por ciudad o nombre del centro…"
                className="mp-form-field-accent min-h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-2.5 pl-10 pr-4 text-base text-zinc-900 placeholder:text-zinc-400 transition-[border-color,background-color,box-shadow] duration-200 ease-out focus:bg-white focus:outline-none sm:min-h-0 sm:text-sm"
                enterKeyHint="search"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Estado</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: STATUS.all, label: "Todos" },
                  { id: STATUS.available, label: "Disponibles" },
                  { id: STATUS.soon, label: "Próximamente" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStatus(id)}
                    className={`${chipBase} ${status === id ? chipOn : chipOff}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Ubicación</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: LOCATION.all, label: "Todas" },
                  { id: LOCATION.caracas, label: "Caracas" },
                  { id: LOCATION.other, label: "Otras ciudades" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLocation(id)}
                    className={`${chipBase} ${location === id ? chipOn : chipOff}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <AdminFilterClearButton show={filtersActive} onClick={clearFilters} />
          </div>
        </div>
      </div>

      {loadError ? (
        <EmptyState
          icon={<EmptyStateIconBuilding />}
          title="No pudimos cargar los centros"
          description="Comprueba tu conexión e inténtalo de nuevo en unos minutos. Si el problema continúa, contacta a soporte."
        />
      ) : dataReady && totalCount === 0 && !filtersActive ? (
        <EmptyState
          icon={<EmptyStateIconBuilding />}
          title="No hay centros para mostrar"
          description="Todavía no hay centros en portada o faltan por configurar. Puedes gestionarlos desde el panel de administración."
        />
      ) : dataReady && totalCount === 0 && filtersActive ? (
        <EmptyState
          icon={<EmptyStateIconSearchOff />}
          title="Nada coincide con tu búsqueda"
          description="Prueba otro texto o quita filtros de estado y ubicación para ver todos los centros."
          action={<FilterClearAction onClick={clearFilters} className="mx-auto justify-center" />}
        />
      ) : (
        <>
          <p className="text-sm text-zinc-500">
            Mostrando{" "}
            <span className="font-semibold tabular-nums text-zinc-800">{malls.length}</span> de{" "}
            <span className="font-semibold tabular-nums text-zinc-800">{totalCount}</span> centros
            {loading ? <span className="ml-2 text-zinc-400">(actualizando…)</span> : null}
          </p>
          <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {malls.map((mall) => (
              <li key={mall.id}>
                <MallCard mall={mall} />
              </li>
            ))}
          </ul>
          <AdminListPagination page={page} totalCount={totalCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

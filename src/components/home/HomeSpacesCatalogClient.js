"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import { HomeSpacesCatalogSkeleton } from "@/components/home/HomeSpacesCatalogSkeleton";
import { SpaceCardWithCart } from "@/components/space/SpaceCardWithCart";
import {
  EmptyState,
  EmptyStateIconSearchOff,
} from "@/components/ui/EmptyState";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { FilterClearAction } from "@/components/admin/AdminListFilters";
import { AdminListPagination } from "@/components/admin/AdminListPagination";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  buildHomeCatalogFacetsKey,
  buildHomeCatalogPageKey,
  homeCatalogFacetsFetcher,
  homeCatalogPageFetcher,
} from "@/lib/swr/homeCatalogSwr";

function heroAvailabilityLine(totalSpaces, locationCount, omitLocations) {
  const esp =
    totalSpaces === 1
      ? "1 espacio disponible"
      : `${totalSpaces} espacios disponibles`;
  if (omitLocations) return esp;
  const ubi =
    locationCount === 1 ? "1 ubicación" : `${locationCount} ubicaciones`;
  return `${esp} en ${ubi}`;
}

const chipBase =
  "mp-ring-brand inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ease-out focus-visible:outline-none active:scale-[0.97] sm:min-h-0 sm:py-1.5";

const chipOff =
  "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50";

const chipOn =
  "border-zinc-800 bg-zinc-800 text-white shadow-md ring-1 ring-zinc-700/50 hover:border-zinc-700 hover:bg-zinc-700";

function facetLabel(item) {
  if (item && typeof item.label === "string" && item.label.trim() !== "")
    return item.label;
  if (item && typeof item.city === "string") return item.city;
  return "";
}

export function HomeSpacesCatalogClient() {
  const { displayName } = useWorkspace();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const centerSlug = useMemo(() => (searchParams.get("center") || "").trim(), [searchParams]);

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);

  const pageKey = useMemo(
    () => buildHomeCatalogPageKey({ search: debouncedQuery, city: selectedCity, center: centerSlug, page }),
    [debouncedQuery, selectedCity, centerSlug, page],
  );
  const facetsKey = useMemo(
    () => buildHomeCatalogFacetsKey({ search: debouncedQuery, center: centerSlug }),
    [debouncedQuery, centerSlug],
  );

  const {
    data: pageData,
    error: loadError,
    isLoading: pageLoading,
  } = useSWR(pageKey, homeCatalogPageFetcher, {
    keepPreviousData: true,
    dedupingInterval: 3000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const { data: facetsData, error: facetsError } = useSWR(facetsKey, homeCatalogFacetsFetcher, {
    dedupingInterval: 3000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const spaces = useMemo(
    () => (Array.isArray(pageData?.results) ? pageData.results : []),
    [pageData],
  );
  const totalCount = typeof pageData?.count === "number" ? pageData.count : 0;
  const facets = useMemo(() => {
    if (!facetsData || typeof facetsData !== "object") return { total: 0, items: [] };
    const total = typeof facetsData.total === "number" ? facetsData.total : 0;
    const items = Array.isArray(facetsData.items) ? facetsData.items : [];
    return { total, items };
  }, [facetsData]);

  const filtersActive = useMemo(
    () => selectedCity.trim() !== "" || query.trim() !== "" || centerSlug !== "",
    [selectedCity, query, centerSlug],
  );

  const dataReady = pageData !== undefined || loadError != null;
  const showPageSkeleton = pageLoading && !pageData && loadError == null;

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedCity, centerSlug]);

  function clearFilters() {
    setSelectedCity("");
    setQuery("");
    setPage(1);
    const p = new URLSearchParams(searchParams.toString());
    p.delete("center");
    const s = p.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  const totalForPills = useMemo(() => {
    if (facets.total > 0 || facets.items.length > 0) return facets.total;
    if (loadError || !dataReady) return 0;
    if (selectedCity === "") return totalCount;
    return facets.total;
  }, [
    facets.total,
    facets.items.length,
    loadError,
    dataReady,
    selectedCity,
    totalCount,
  ]);

  const locationCount = facets.items.length;
  const heroOmitLocations =
    Boolean(facetsError) && locationCount === 0 && totalForPills > 0;
  const heroSummary = useMemo(
    () => heroAvailabilityLine(totalForPills, locationCount, heroOmitLocations),
    [totalForPills, locationCount, heroOmitLocations],
  );

  const showFacetsWarning = facetsError != null && loadError == null;

  if (showPageSkeleton) {
    return <HomeSpacesCatalogSkeleton />;
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <section
        className="space-y-4 sm:space-y-5"
        aria-labelledby="home-catalog-heading"
      >
        <div className="-mx-4 rounded-2xl px-4 pb-3 pt-5 sm:-mx-6 sm:rounded-3xl sm:px-6 sm:pb-4 sm:pt-6 lg:-mx-8 lg:px-8">
          <header className="max-w-3xl space-y-4">
            <div className="inline-flex w-max max-w-full flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full border border-zinc-200/90 bg-white/80 px-3.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/[0.04] backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Reserva de medios
              </span>
              <span
                className="hidden h-3 w-px shrink-0 bg-zinc-200 sm:block"
                aria-hidden
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
                {displayName}
              </span>
            </div>
            <h1
              id="home-catalog-heading"
              className="text-balance text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl sm:leading-[1.12]"
            >
              Espacios publicitarios
            </h1>
            <p className="text-[15px] leading-relaxed text-zinc-600 sm:text-base">
              {heroSummary}
            </p>
          </header>
        </div>

        <div className="space-y-5">
          <label htmlFor="space-search" className="sr-only">
            Buscar espacio o ubicación
          </label>
          <div className="relative w-full">
            <span
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
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
              id="space-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar espacio o ubicación…"
              className="mp-form-field-accent min-h-12 w-full rounded-full border border-zinc-200 bg-white py-3 pl-11 pr-4 text-base text-zinc-900 placeholder:text-zinc-400 transition-[border-color,box-shadow] duration-200 ease-out focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--mp-primary)_22%,transparent)] sm:min-h-11 sm:text-sm"
              enterKeyHint="search"
              autoComplete="off"
            />
          </div>

          <div
            className="mp-hide-scrollbar -mx-1 w-full overflow-x-auto overscroll-x-contain px-1 [-webkit-overflow-scrolling:touch] sm:-mx-0 sm:px-0"
            role="toolbar"
            aria-label="Filtrar por ciudad"
          >
            <div className="flex w-max max-w-none flex-nowrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCity("")}
                className={`${chipBase} ${selectedCity === "" ? chipOn : chipOff}`}
              >
                <span>Todos</span>
                <span
                  className={
                    selectedCity === ""
                      ? "tabular-nums text-zinc-200"
                      : "tabular-nums font-medium text-zinc-400"
                  }
                >
                  {totalForPills}
                </span>
              </button>
              {facets.items.map((item) => {
                const key =
                  typeof item.city === "string" ? item.city : String(item.city);
                const label = facetLabel(item);
                const active = selectedCity === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCity(active ? "" : key)}
                    className={`${chipBase} ${active ? chipOn : chipOff}`}
                  >
                    <span className="max-w-[10rem] truncate">{label}</span>
                    <span
                      className={
                        active
                          ? "tabular-nums text-zinc-200"
                          : "tabular-nums font-medium text-zinc-400"
                      }
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
              {filtersActive ? (
                <FilterClearAction
                  onClick={clearFilters}
                  className="shrink-0 self-center justify-center sm:ml-1"
                />
              ) : null}
            </div>
          </div>
          {showFacetsWarning ? (
            <p className="text-xs text-amber-800">
              No pudimos cargar los conteos por ciudad; aún puedes filtrar con
              la lista cargada.
            </p>
          ) : null}
        </div>
      </section>

      {loadError ? (
        <EmptyState
          icon={<EmptyStateIconSearchOff />}
          title="No pudimos cargar los espacios"
          description="Comprueba tu conexión e inténtalo de nuevo en unos minutos. Si el problema continúa, contacta a soporte."
        />
      ) : dataReady && totalCount === 0 && !filtersActive ? (
        <EmptyState
          icon={<EmptyStateIconSearchOff />}
          title="No hay espacios para mostrar"
          description="Todavía no hay tomas publicadas en el catálogo. Vuelve más tarde."
        />
      ) : dataReady && totalCount === 0 && filtersActive ? (
        <EmptyState
          icon={<EmptyStateIconSearchOff />}
          title="Nada coincide con tu búsqueda"
          description="Prueba otro texto o cambia la ciudad para ver más resultados."
          action={
            <FilterClearAction
              onClick={clearFilters}
              className="mx-auto justify-center"
            />
          }
        />
      ) : (
        <div className="space-y-6">
          <ul className="grid list-none gap-[10px] p-0 sm:grid-cols-2 lg:grid-cols-4">
            {spaces.map((space, index) => (
              <li key={space.id}>
                <SpaceCardWithCart
                  space={space}
                  availabilityLabel="occupied"
                  showFooterLink={false}
                  priority={index < 4}
                />
              </li>
            ))}
          </ul>
          <AdminListPagination
            page={page}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

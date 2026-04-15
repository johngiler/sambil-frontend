/**
 * Claves y fetchers SWR del catálogo público de tomas (portada).
 * Permite revalidar desde el panel admin tras crear/editar/eliminar tomas.
 */

import { getSpacesCatalogPage, getSpacesLocationFacets } from "@/services/api";

export const HOME_CATALOG_PAGE_SWR_TAG = "home-catalog-page";
export const HOME_CATALOG_FACETS_SWR_TAG = "home-catalog-facets";

/**
 * Opciones del listado público del home.
 *
 * **No uses `revalidateOnMount: false` con SWR 2.x:** si está definido y es `false`, la primera
 * revalidación al montar **no se ejecuta** (`shouldDoInitialRevalidation` queda en false) y no hay
 * fetch hasta otro disparador (p. ej. foco de ventana). Eso dejaba el catálogo vacío hasta hacer focus.
 *
 * Para reducir refetch al volver a `/` con la misma clave (sin romper la primera carga), usa
 * `revalidateIfStale: false` en su lugar, no `revalidateOnMount: false`.
 */
export const homeCatalogSwrOptions = {
  keepPreviousData: true,
  dedupingInterval: 60_000,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};

/**
 * @param {{ search?: string, city?: string, center?: string, page?: number }} p
 * @returns {readonly [string, string, string, string, number]}
 */
export function buildHomeCatalogPageKey({ search = "", city = "", center = "", page = 1 } = {}) {
  const pg = Number(page);
  return [HOME_CATALOG_PAGE_SWR_TAG, String(search), String(city), String(center), Number.isFinite(pg) && pg > 0 ? pg : 1];
}

/**
 * @param {{ search?: string, center?: string }} p
 * @returns {readonly [string, string, string]}
 */
export function buildHomeCatalogFacetsKey({ search = "", center = "" } = {}) {
  return [HOME_CATALOG_FACETS_SWR_TAG, String(search), String(center)];
}

/** @param {readonly unknown[]} key */
export async function homeCatalogPageFetcher(key) {
  if (!Array.isArray(key) || key[0] !== HOME_CATALOG_PAGE_SWR_TAG) {
    throw new Error("homeCatalogPageFetcher: clave inválida");
  }
  const [, search, city, center, page] = key;
  return getSpacesCatalogPage({
    search: /** @type {string} */ (search),
    city: /** @type {string} */ (city),
    center: /** @type {string} */ (center),
    page: /** @type {number} */ (page),
  });
}

/** @param {readonly unknown[]} key */
export async function homeCatalogFacetsFetcher(key) {
  if (!Array.isArray(key) || key[0] !== HOME_CATALOG_FACETS_SWR_TAG) {
    throw new Error("homeCatalogFacetsFetcher: clave inválida");
  }
  const [, search, center] = key;
  return getSpacesLocationFacets({
    search: /** @type {string} */ (search),
    center: /** @type {string} */ (center),
  });
}

/** Revalida listado y facets del home (pasa `mutate` de `useSWRConfig()`). */
export function revalidateHomeCatalog(mutate) {
  return mutate(
    (key) =>
      Array.isArray(key) &&
      (key[0] === HOME_CATALOG_PAGE_SWR_TAG || key[0] === HOME_CATALOG_FACETS_SWR_TAG),
    undefined,
    { revalidate: true },
  );
}

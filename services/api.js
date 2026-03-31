/**
 * Base del API. En producción: NEXT_PUBLIC_API_URL obligatorio.
 * En desarrollo en el navegador, fallback a :8000 si falta la var.
 */
export function apiBase() {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/$/, "");
  if (env) return env;
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:8000";
  }
  return "";
}

/** URL absoluta para medios del API (p. ej. `/media/...` → host del backend). */
export function mediaAbsoluteUrl(maybeRelative) {
  if (maybeRelative == null || maybeRelative === "") return "";
  const s = String(maybeRelative);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const b = apiBase().replace(/\/$/, "");
  const p = s.startsWith("/") ? s : `/${s}`;
  return b ? `${b}${p}` : p;
}

/**
 * Normaliza URL de imagen para el navegador (evita `localhost` vs `127.0.0.1` en dev y mezcla de hosts).
 * @param {string | null | undefined} url
 */
export function normalizeMediaUrlForUi(url) {
  const abs = mediaAbsoluteUrl(url);
  if (!abs) return "";
  if (process.env.NODE_ENV !== "development") return abs;
  return abs.replace(/^http:\/\/localhost(?::8000)?(?=\/|$)/i, "http://127.0.0.1:8000");
}

export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const b = apiBase();
  return `${b}${p}`;
}

/** Parsea cuerpo JSON; si falla devuelve el string crudo. */
export function parseJsonText(text) {
  if (text == null || text === "") return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function parseFetchResponse(res) {
  const text = await res.text();
  return {
    ok: res.ok,
    status: res.status,
    data: parseJsonText(text),
    text,
  };
}

/**
 * Convierte `next` absoluto de DRF en ruta relativa para `fetch`.
 * @param {string | null | undefined} next
 */
export function drfNextToRelativePath(next) {
  if (!next) return null;
  try {
    const u = new URL(next);
    return u.pathname + u.search;
  } catch {
    const s = String(next);
    return s.startsWith("/") ? s : null;
  }
}

/**
 * Respuesta paginada DRF (`count`, `next`, `previous`, `results`) o array.
 * @returns {{ results: Array<unknown>, count: number, next: string | null, previous: string | null }}
 */
export function parsePaginatedResponse(data) {
  if (data && Array.isArray(data.results)) {
    return {
      results: data.results,
      count: typeof data.count === "number" ? data.count : data.results.length,
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }
  if (data && Array.isArray(data.spaces)) {
    return {
      results: data.spaces,
      count: data.spaces.length,
      next: null,
      previous: null,
    };
  }
  if (Array.isArray(data)) {
    return { results: data, count: data.length, next: null, previous: null };
  }
  return { results: [], count: 0, next: null, previous: null };
}

/** Lista paginada DRF o array plano (solo el array `results`). */
export function normalizeListPayload(data) {
  return parsePaginatedResponse(data).results;
}

export async function fetchJson(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    next: options.next ?? { revalidate: 30 },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchJsonFirst(paths, options = {}) {
  let last = null;
  for (const path of paths) {
    try {
      return await fetchJson(path, options);
    } catch (e) {
      last = e;
    }
  }
  throw last ?? new Error("No hubo respuesta del servicio");
}

/**
 * Sigue enlaces `next` hasta agotar páginas (DRF).
 * @param {(path: string) => Promise<unknown>} fetchJsonFn
 * @param {string} firstPath
 */
export async function fetchAllPagesWithJson(fetchJsonFn, firstPath) {
  const all = [];
  let path = firstPath;
  while (path) {
    const data = await fetchJsonFn(path);
    const p = parsePaginatedResponse(data);
    all.push(...p.results);
    path = p.next ? drfNextToRelativePath(p.next) : null;
  }
  return all;
}

export async function getSpaces(centerCode) {
  const q =
    centerCode != null && String(centerCode).trim() !== ""
      ? `?center=${encodeURIComponent(centerCode)}`
      : "";
  const paths = [`/api/spaces${q}`, `/api/catalog/spaces${q}`];
  for (const path of paths) {
    try {
      return await fetchAllPagesWithJson(fetchJson, path);
    } catch {
      /* try next base path */
    }
  }
  return [];
}

export async function getSpace(id) {
  const paths = [`/api/spaces/${id}/`, `/api/catalog/spaces/${id}/`];
  return fetchJsonFirst(paths);
}

export async function getCenters() {
  const paths = ["/api/centers/", "/api/catalog/centers/"];
  for (const path of paths) {
    try {
      return await fetchAllPagesWithJson(fetchJson, path);
    } catch {
      /* try next */
    }
  }
  return [];
}

/**
 * Cliente fetch sin caché (navegador).
 * @param {string} path
 */
async function fetchJsonClientNoStore(path) {
  const res = await fetch(apiUrl(path), {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchAllPagesClient(firstPath) {
  const all = [];
  let path = firstPath;
  while (path) {
    const data = await fetchJsonClientNoStore(path);
    const p = parsePaginatedResponse(data);
    all.push(...p.results);
    path = p.next ? drfNextToRelativePath(p.next) : null;
  }
  return all;
}

/**
 * Todos los centros con catálogo disponible (texto intro portada).
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function fetchCentersCatalogAvailableAll() {
  const qs = "?catalog_status=available&page_size=100";
  const paths = [`/api/centers/${qs}`, `/api/catalog/centers/${qs}`];
  for (const path of paths) {
    try {
      return await fetchAllPagesClient(path);
    } catch {
      /* try next */
    }
  }
  return [];
}

/**
 * Portada: listado paginado con filtros en el servidor.
 * @param {{ search?: string, catalogStatus?: string, location?: string, page?: number }} params
 * @returns {Promise<{ results: Array<Record<string, unknown>>, count: number, next: string | null, previous: string | null }>}
 */
export async function getCentersCatalogPage({
  search = "",
  catalogStatus = "all",
  location = "all",
  page = 1,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (search.trim()) params.set("search", search.trim());
  if (catalogStatus && catalogStatus !== "all") params.set("catalog_status", catalogStatus);
  if (location && location !== "all") params.set("location", location);
  const qs = `?${params.toString()}`;
  const paths = [`/api/centers/${qs}`, `/api/catalog/centers/${qs}`];
  let last = null;
  for (const path of paths) {
    try {
      const res = await fetch(apiUrl(path), {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return parsePaginatedResponse(data);
    } catch (e) {
      last = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw last ?? new Error("No hubo respuesta del servicio");
}

/** Detalle público por código (`SCC`, `SLC`, …). */
export async function getCenterByCode(code) {
  const c = String(code || "").trim().toUpperCase();
  if (!c) throw new Error("Código de centro vacío");
  const path = `/api/centers/${encodeURIComponent(c)}/`;
  const pathCatalog = `/api/catalog/centers/${encodeURIComponent(c)}/`;
  return fetchJsonFirst([path, pathCatalog]);
}

export function errorMessageFromParsed({ data, text, status }) {
  if (typeof data === "object" && data !== null) return JSON.stringify(data);
  return text || `HTTP ${status}`;
}

export async function postJson(path, body, options = {}) {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const parsed = await parseFetchResponse(res);
  if (!parsed.ok) throw new Error(errorMessageFromParsed(parsed));
  return parsed.data;
}

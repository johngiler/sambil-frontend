import { workspaceSlugRequestHeaders } from "@/lib/tenant";

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

/**
 * Si el API público es HTTPS pero el backend devolvió `http://mismo-host/...` (p. ej. tras proxy),
 * el navegador marca la página como «No es seguro» (contenido mixto). Fuerza https solo para ese host.
 */
function upgradeMediaUrlToHttpsIfNeeded(absoluteUrl) {
  const base = apiBase().replace(/\/$/, "");
  if (!absoluteUrl || !base.startsWith("https://") || !absoluteUrl.startsWith("http://")) {
    return absoluteUrl;
  }
  try {
    const bu = new URL(base);
    const u = new URL(absoluteUrl);
    if (u.hostname === bu.hostname && String(u.port || "") === String(bu.port || "")) {
      u.protocol = "https:";
      return u.toString();
    }
  } catch {
    /* ignore */
  }
  return absoluteUrl;
}

/** URL absoluta para medios del API (p. ej. `/media/...` → host del backend). */
export function mediaAbsoluteUrl(maybeRelative) {
  if (maybeRelative == null || maybeRelative === "") return "";
  const s = String(maybeRelative);
  if (s.startsWith("http://") || s.startsWith("https://")) {
    return upgradeMediaUrlToHttpsIfNeeded(s);
  }
  const b = apiBase().replace(/\/$/, "");
  const p = s.startsWith("/") ? s : `/${s}`;
  const out = b ? `${b}${p}` : p;
  return upgradeMediaUrlToHttpsIfNeeded(out);
}

/**
 * Normaliza URL de imagen para el navegador (evita `localhost` vs `127.0.0.1` en dev y mezcla de hosts).
 * En desarrollo, si el API devolvió una URL absoluta con otro host (p. ej. `sambil.localhost:8000` tras el admin)
 * pero `NEXT_PUBLIC_API_URL` apunta a `127.0.0.1`, `next/image` rechaza el host y la imagen se rompe.
 * Para rutas bajo `/media/` se fuerza el origen de `apiBase()`.
 * @param {string | null | undefined} url
 */
export function normalizeMediaUrlForUi(url) {
  const abs = mediaAbsoluteUrl(url);
  if (!abs) return "";
  if (process.env.NODE_ENV !== "development") return abs;
  try {
    const u = new URL(abs);
    const isMediaPath =
      u.pathname === "/media" || u.pathname.startsWith("/media/");
    if (isMediaPath) {
      const baseStr = apiBase().replace(/\/$/, "");
      if (baseStr) {
        const b = new URL(baseStr.match(/^https?:\/\//i) ? baseStr : `http://${baseStr}`);
        u.protocol = b.protocol;
        u.hostname = b.hostname;
        u.port = b.port;
        return u.toString();
      }
    }
  } catch {
    /* ignore */
  }
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

/**
 * Valida rango de fechas contra reservas y bloques (misma regla que al enviar la orden).
 * @param {string | number} spaceId
 * @param {{ start_date: string, end_date: string }} range ISO date (YYYY-MM-DD)
 * @returns {Promise<{ ok: boolean, detail?: string }>}
 */
export async function postSpaceRentalRangeCheck(spaceId, { start_date, end_date }) {
  const body = JSON.stringify({ start_date, end_date });
  const headers = {
    "Content-Type": "application/json",
    ...workspaceSlugRequestHeaders(),
  };
  const sid = encodeURIComponent(String(spaceId));
  const paths = [`/api/spaces/${sid}/check-rental-range/`, `/api/catalog/spaces/${sid}/check-rental-range/`];
  let last = null;
  for (const path of paths) {
    try {
      const res = await fetch(apiUrl(path), {
        method: "POST",
        headers,
        body,
        cache: "no-store",
      });
      const parsed = await parseFetchResponse(res);
      if (!parsed.ok) throw new Error(errorMessageFromParsed(parsed));
      return /** @type {{ ok: boolean, detail?: string }} */ (parsed.data);
    } catch (e) {
      last = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw last ?? new Error("No hubo respuesta del servicio");
}

/**
 * Portada: tomas paginadas con búsqueda y filtro por ciudad del centro.
 * @param {{ search?: string, city?: string, page?: number, pageSize?: number }} params
 * @returns {Promise<{ results: Array<Record<string, unknown>>, count: number, next: string | null, previous: string | null }>}
 */
export async function getSpacesCatalogPage({
  search = "",
  city = "",
  page = 1,
  pageSize = 20,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (pageSize && pageSize !== 20) params.set("page_size", String(pageSize));
  if (search.trim()) params.set("search", search.trim());
  if (city.trim()) params.set("city", city.trim());
  const qs = `?${params.toString()}`;
  const paths = [`/api/spaces/${qs}`, `/api/catalog/spaces/${qs}`];
  const headers = {
    "Content-Type": "application/json",
    ...workspaceSlugRequestHeaders(),
  };
  let last = null;
  for (const path of paths) {
    try {
      const res = await fetch(apiUrl(path), { headers, cache: "no-store" });
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

/**
 * Conteos por ciudad para pills (respeta la misma búsqueda que el listado).
 * @param {{ search?: string }} params
 * @returns {Promise<{ total: number, items: Array<{ city: string, count: number, label?: string }> }>}
 */
export async function getSpacesLocationFacets({ search = "" } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  const q = params.toString();
  const suffix = q ? `?${q}` : "";
  const paths = [
    `/api/spaces/location-facets/${suffix}`,
    `/api/catalog/spaces/location-facets/${suffix}`,
  ];
  const headers = {
    "Content-Type": "application/json",
    ...workspaceSlugRequestHeaders(),
  };
  let last = null;
  for (const path of paths) {
    try {
      const res = await fetch(apiUrl(path), { headers, cache: "no-store" });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      return await res.json();
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
  if (typeof data === "object" && data !== null) {
    const d = /** @type {Record<string, unknown>} */ (data).detail;
    if (typeof d === "string" && d.trim()) return d.trim();
    if (Array.isArray(d) && d.length) return d.map(String).filter(Boolean).join(" ");
    return JSON.stringify(data);
  }
  if (typeof data === "string" && data.trim()) return data.trim();
  return text || `HTTP ${status}`;
}

/**
 * Mensaje legible desde cuerpo 400 de `/api/auth/validate-password/` u otros con clave `password`.
 * @param {unknown} data
 */
export function formatPasswordPolicyErrorBody(data) {
  if (data == null || typeof data !== "object") {
    return "La contraseña no cumple las reglas de seguridad.";
  }
  const p = /** @type {Record<string, unknown>} */ (data).password;
  if (Array.isArray(p)) {
    const s = p.map(String).filter(Boolean).join(" ");
    return s || "La contraseña no cumple las reglas de seguridad.";
  }
  if (typeof p === "string" && p.trim()) return p.trim();
  return "La contraseña no cumple las reglas de seguridad.";
}

/** Comprueba la contraseña con las mismas reglas que el backend (checkout / registro). */
export async function postValidatePassword(password) {
  const res = await fetch(apiUrl("/api/auth/validate-password/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...workspaceSlugRequestHeaders(),
    },
    body: JSON.stringify({ password }),
    cache: "no-store",
  });
  const parsed = await parseFetchResponse(res);
  if (!parsed.ok) throw new Error(formatPasswordPolicyErrorBody(parsed.data));
  return parsed.data;
}

/**
 * Comprueba si el correo puede usarse al crear cuenta en checkout invitado (paso datos).
 * @param {string} email
 * @returns {Promise<{ available: boolean, detail?: string, code?: string }>}
 */
/**
 * Comprueba si el correo ya está asociado a un cliente del tenant (y si tiene cuenta marketplace).
 * @param {string} email
 * @returns {Promise<{ client_exists: boolean, has_marketplace_account: boolean }>}
 */
export async function postGuestCheckoutClientEmailCheck(email) {
  const res = await fetch(apiUrl("/api/checkout/guest/check-client-email/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...workspaceSlugRequestHeaders(),
    },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });
  const parsed = await parseFetchResponse(res);
  if (!parsed.ok) throw new Error(errorMessageFromParsed(parsed));
  return /** @type {{ client_exists: boolean, has_marketplace_account: boolean }} */ (parsed.data);
}

/**
 * Valida correo y razón social del checkout invitado (al pulsar Continuar en datos).
 * @param {{ email: string, company_name: string }} body
 * @returns {Promise<{ email: { client_exists: boolean, has_marketplace_account: boolean }, company: { client_exists: boolean, has_marketplace_account: boolean }, same_client: boolean }>}
 */
export async function postGuestCheckoutValidateDatos(body) {
  const res = await fetch(apiUrl("/api/checkout/guest/validate-datos/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...workspaceSlugRequestHeaders(),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const parsed = await parseFetchResponse(res);
  if (!parsed.ok) throw new Error(errorMessageFromParsed(parsed));
  return /** @type {{ email: { client_exists: boolean, has_marketplace_account: boolean }, company: { client_exists: boolean, has_marketplace_account: boolean }, same_client: boolean }} */ (
    parsed.data
  );
}

export async function postGuestCheckoutEmailAvailable(email) {
  const res = await fetch(apiUrl("/api/checkout/guest/check-email/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...workspaceSlugRequestHeaders(),
    },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });
  const parsed = await parseFetchResponse(res);
  if (!parsed.ok) throw new Error(errorMessageFromParsed(parsed));
  return /** @type {{ available: boolean, detail?: string, code?: string }} */ (parsed.data);
}

/**
 * Checkout sin sesión: empresa + orden enviada; opcional crear usuario marketplace.
 * @param {Record<string, unknown>} body
 */
export async function postGuestCheckout(body) {
  const res = await fetch(apiUrl("/api/checkout/guest/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...workspaceSlugRequestHeaders(),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const parsed = await parseFetchResponse(res);
  if (!parsed.ok) throw new Error(errorMessageFromParsed(parsed));
  return parsed.data;
}

/** Activa cuenta con enlace del correo (tras aprobar orden). */
export async function postActivateClientAccount({ token, password }) {
  const res = await fetch(apiUrl("/api/auth/activate-client/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...workspaceSlugRequestHeaders(),
    },
    body: JSON.stringify({ token, password }),
    cache: "no-store",
  });
  const parsed = await parseFetchResponse(res);
  if (!parsed.ok) throw new Error(errorMessageFromParsed(parsed));
  return parsed.data;
}

/** Datos del correo para el formulario de definir contraseña (enlace del administrador). */
export async function getPasswordSetupIntent(token) {
  const q = new URLSearchParams();
  q.set("token", String(token || "").trim());
  const res = await fetch(apiUrl(`/api/auth/password-setup-intent/?${q}`), {
    headers: { ...workspaceSlugRequestHeaders() },
    cache: "no-store",
  });
  const parsed = await parseFetchResponse(res);
  if (!parsed.ok) throw new Error(errorMessageFromParsed(parsed));
  return /** @type {{ email: string }} */ (parsed.data);
}

/** Primera contraseña para usuario creado sin clave (token firmado). */
export async function postSetInitialPassword({ token, password, password_confirm }) {
  const res = await fetch(apiUrl("/api/auth/set-initial-password/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...workspaceSlugRequestHeaders(),
    },
    body: JSON.stringify({ token, password, password_confirm }),
    cache: "no-store",
  });
  const parsed = await parseFetchResponse(res);
  if (!parsed.ok) throw new Error(errorMessageFromParsed(parsed));
  return parsed.data;
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

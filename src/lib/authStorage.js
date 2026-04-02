import { storageKeySuffix } from "@/lib/tenant";

const LEGACY_ACCESS = "sambil_access";
const LEGACY_REFRESH = "sambil_refresh";

function keys() {
  const s = storageKeySuffix();
  return {
    access: `mp_access_${s}`,
    refresh: `mp_refresh_${s}`,
  };
}

/** Migra tokens antiguos (una sola vez por carga). */
export function clearLegacyAuthKeys() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_ACCESS);
    localStorage.removeItem(LEGACY_REFRESH);
  } catch {
    /* ignore */
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(keys().access);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(keys().refresh);
}

export function setTokens(access, refresh) {
  if (typeof window === "undefined") return;
  const k = keys();
  if (access) localStorage.setItem(k.access, access);
  else localStorage.removeItem(k.access);
  if (refresh) localStorage.setItem(k.refresh, refresh);
  else localStorage.removeItem(k.refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  const k = keys();
  localStorage.removeItem(k.access);
  localStorage.removeItem(k.refresh);
}

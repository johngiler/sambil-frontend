const ACCESS = "sambil_access";
const REFRESH = "sambil_refresh";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH);
}

export function setTokens(access, refresh) {
  if (typeof window === "undefined") return;
  if (access) localStorage.setItem(ACCESS, access);
  else localStorage.removeItem(ACCESS);
  if (refresh) localStorage.setItem(REFRESH, refresh);
  else localStorage.removeItem(REFRESH);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}

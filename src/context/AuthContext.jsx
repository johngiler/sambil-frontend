"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { clearLegacyAuthKeys, getAccessToken } from "@/lib/authStorage";
import { useRouter } from "next/navigation";

import {
  fetchMe,
  fetchMyCompany,
  loginRequest,
  logoutStorage,
  refreshAccessToken,
} from "@/services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [accessToken, setAccessTokenState] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [me, setMe] = useState(null);
  /** `undefined` = aún no cargado; `null` = sin ficha (204); objeto = empresa */
  const [company, setCompany] = useState(undefined);

  useEffect(() => {
    clearLegacyAuthKeys();
    setAccessTokenState(getAccessToken());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    (async () => {
      setSessionLoading(true);
      const token = accessToken;
      if (!token) {
        setMe(null);
        setCompany(undefined);
        if (!cancelled) setSessionLoading(false);
        return;
      }

      let t = token;
      let m = await fetchMe(t);
      if (!m) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          t = refreshed;
          if (!cancelled) setAccessTokenState(refreshed);
          m = await fetchMe(refreshed);
        }
      }

      if (cancelled) return;
      setMe(m);
      // Tras fetchMe (p. ej. 403 → clearTokens), alinear estado con almacenamiento.
      setAccessTokenState(getAccessToken());

      if (m) {
        const c = await fetchMyCompany(getAccessToken());
        if (cancelled) return;
        setCompany(c === undefined ? null : c);
      } else {
        setCompany(undefined);
      }

      if (!cancelled) setSessionLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, accessToken]);

  const login = useCallback(async (username, password) => {
    await loginRequest(username, password);
    setAccessTokenState(getAccessToken());
  }, []);

  const logout = useCallback(() => {
    logoutStorage();
    setAccessTokenState(null);
    setMe(null);
    setCompany(undefined);
    router.push("/");
    router.refresh();
  }, [router]);

  const refreshSession = useCallback(() => {
    setAccessTokenState(getAccessToken());
  }, []);

  const setCompanyData = useCallback((c) => {
    setCompany(c);
  }, []);

  const refreshUser = useCallback(async () => {
    const t = getAccessToken();
    if (!t) {
      setMe(null);
      setCompany(undefined);
      return null;
    }
    const m = await fetchMe(t);
    setMe(m);
    setAccessTokenState(getAccessToken());
    if (m) {
      const c = await fetchMyCompany(getAccessToken());
      setCompany(c === undefined ? null : c);
    } else {
      setCompany(undefined);
    }
    return m;
  }, []);

  /**
   * Rol desde `/api/auth/me/` (fuente de verdad). Nivel 1 (solo Django) no obtiene `me` (403) y se limpia sesión.
   * Nivel 2: admin; nivel 3: client.
   */
  const role = me?.role ?? null;
  const isAdmin = role === "admin";
  const isClient = role === "client";
  const hasCompanyProfile =
    company !== undefined && company !== null && typeof company === "object";

  const authReady = hydrated && !sessionLoading;

  const value = useMemo(
    () => ({
      hydrated,
      authReady,
      sessionLoading,
      accessToken,
      me,
      company,
      role,
      isAdmin,
      isClient,
      hasCompanyProfile,
      login,
      logout,
      refreshSession,
      refreshUser,
      setCompanyData,
    }),
    [
      hydrated,
      authReady,
      sessionLoading,
      accessToken,
      me,
      company,
      role,
      isAdmin,
      isClient,
      hasCompanyProfile,
      login,
      logout,
      refreshSession,
      refreshUser,
      setCompanyData,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

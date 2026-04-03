"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { workspaceSlugRequestHeaders } from "@/lib/tenant";
import { apiUrl, parseJsonText } from "@/services/api";

const WorkspaceContext = createContext(undefined);

/**
 * @typedef {Object} WorkspacePublic
 * @property {string} slug
 * @property {string} name
 * @property {string} [legal_name]
 * @property {string} [marketplace_title]
 * @property {string} [marketplace_tagline] Eslogan opcional (API; el front puede mostrarlo más adelante).
 * @property {string} [primary_color]
 * @property {string} [secondary_color]
 * @property {string} [support_email]
 * @property {string} [phone]
 * @property {string} [country]
 * @property {string} [city]
 * @property {string|null} [logo_url]
 * @property {string|null} [logo_mark_url]
 * @property {string|null} [favicon_url]
 */

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(null);
  const [workspaceStatus, setWorkspaceStatus] = useState(
    /** @type {'loading' | 'ready' | 'missing' | 'error'} */ ("loading"),
  );
  const [workspaceFetchError, setWorkspaceFetchError] = useState(null);

  const reloadWorkspace = useCallback(async (signal) => {
    try {
      const res = await fetch(apiUrl("/api/workspace/current/"), {
        cache: "no-store",
        headers: { ...workspaceSlugRequestHeaders() },
        ...(signal ? { signal } : {}),
      });
      const text = await res.text();
      const data = parseJsonText(text);
      if (!res.ok) {
        setWorkspace(null);
        if (res.status === 404) {
          setWorkspaceStatus("missing");
          setWorkspaceFetchError(null);
        } else {
          setWorkspaceStatus("error");
          const detail =
            data && typeof data === "object" && !Array.isArray(data) && data.detail != null
              ? String(data.detail)
              : `Error ${res.status}`;
          setWorkspaceFetchError(detail);
        }
        return;
      }
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        setWorkspace(null);
        setWorkspaceStatus("error");
        setWorkspaceFetchError("Respuesta inválida del servidor.");
        return;
      }
      setWorkspace(data);
      setWorkspaceStatus("ready");
      setWorkspaceFetchError(null);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setWorkspace(null);
      setWorkspaceStatus("error");
      setWorkspaceFetchError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    setWorkspaceStatus("loading");
    void reloadWorkspace(ac.signal);
    return () => ac.abort();
  }, [reloadWorkspace]);

  const displayName = useMemo(() => {
    if (!workspace) return "Marketplace";
    const t = (workspace.marketplace_title || "").trim();
    return t || workspace.name || "Marketplace";
  }, [workspace]);

  const loading = workspaceStatus === "loading";

  const value = useMemo(
    () => ({
      workspace,
      loading,
      workspaceStatus,
      workspaceFetchError,
      displayName,
      reloadWorkspace,
    }),
    [workspace, workspaceStatus, workspaceFetchError, displayName, reloadWorkspace],
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (ctx === undefined) {
    throw new Error("useWorkspace debe usarse dentro de WorkspaceProvider");
  }
  return ctx;
}

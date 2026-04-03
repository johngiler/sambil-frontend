"use client";

import {
  createContext,
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/workspace/current/"), {
          cache: "no-store",
          headers: { ...workspaceSlugRequestHeaders() },
        });
        const text = await res.text();
        const data = parseJsonText(text);
        if (!res.ok) {
          if (!cancelled) {
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
          }
          return;
        }
        if (!data || typeof data !== "object" || Array.isArray(data)) {
          if (!cancelled) {
            setWorkspace(null);
            setWorkspaceStatus("error");
            setWorkspaceFetchError("Respuesta inválida del servidor.");
          }
          return;
        }
        if (!cancelled) {
          setWorkspace(data);
          setWorkspaceStatus("ready");
          setWorkspaceFetchError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setWorkspace(null);
          setWorkspaceStatus("error");
          setWorkspaceFetchError(e instanceof Error ? e.message : String(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    }),
    [workspace, workspaceStatus, workspaceFetchError, displayName],
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

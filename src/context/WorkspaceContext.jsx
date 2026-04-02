"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiUrl } from "@/services/api";

const WorkspaceContext = createContext(undefined);

/**
 * @typedef {Object} WorkspacePublic
 * @property {string} slug
 * @property {string} name
 * @property {string} [legal_name]
 * @property {string} [marketplace_title]
 * @property {string} [marketplace_tagline]
 * @property {string} [primary_color]
 * @property {string} [secondary_color]
 * @property {string} [support_email]
 * @property {string|null} [logo_url]
 * @property {string|null} [logo_mark_url]
 * @property {string|null} [favicon_url]
 */

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/workspace/current/"), {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) {
            setError(res.status);
            setWorkspace(null);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setWorkspace(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setWorkspace(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
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

  const value = useMemo(
    () => ({
      workspace,
      loading,
      error,
      displayName,
    }),
    [workspace, loading, error, displayName],
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

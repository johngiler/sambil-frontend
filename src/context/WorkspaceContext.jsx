"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import useSWR from "swr";

import {
  WORKSPACE_CURRENT_SWR_KEY,
  workspaceCurrentFetcher,
} from "@/lib/swr/fetchers";

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
  const { data, error, isLoading, mutate } = useSWR(WORKSPACE_CURRENT_SWR_KEY, workspaceCurrentFetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    errorRetryCount: 1,
  });

  const workspace = data?.workspace ?? null;

  const workspaceStatus = useMemo(() => {
    if (isLoading && !data && !error) return "loading";
    if (error) return "error";
    if (data?.workspaceStatus === "missing") return "missing";
    if (data?.workspaceStatus === "ready") return "ready";
    return "loading";
  }, [isLoading, data, error]);

  const workspaceFetchError = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (error) return String(error);
    return null;
  }, [error]);

  const reloadWorkspace = useCallback(
    async (_signal) => {
      await mutate();
    },
    [mutate],
  );

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
    [workspace, loading, workspaceStatus, workspaceFetchError, displayName, reloadWorkspace],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (ctx === undefined) {
    throw new Error("useWorkspace debe usarse dentro de WorkspaceProvider");
  }
  return ctx;
}

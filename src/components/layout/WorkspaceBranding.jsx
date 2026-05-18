"use client";

import { useEffect } from "react";

import { useWorkspace } from "@/context/WorkspaceContext";
import { normalizeMediaUrlForUi } from "@/lib/mediaUrls";

const DEFAULT_PRIMARY = "#0c9dcf";
const DEFAULT_SECONDARY = "#ea580c";

/** Favicon neutro si el owner no subió uno (`public/favicon.ico`). */
const NEUTRAL_FAVICON_HREF = "/favicon.ico";

const MANAGED_ICON_ATTR = "data-mp-managed-icon";

/** Rutas estáticas del SPA que no deben competir con el favicon del tenant. */
const STATIC_ICON_HREFS = new Set(["/favicon.ico", "/icon.svg"]);

function normalizeBrandMediaUrl(raw) {
  if (raw == null || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return normalizeMediaUrlForUi(trimmed) || trimmed;
}

function resolveTenantFaviconHref(workspace) {
  if (!workspace || typeof workspace !== "object") return null;
  const favicon = normalizeBrandMediaUrl(workspace.favicon_url);
  if (favicon) return favicon;
  return normalizeBrandMediaUrl(workspace.logo_mark_url);
}

function removeStaticDefaultIconLinks() {
  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((el) => {
    if (el.getAttribute(MANAGED_ICON_ATTR) === "true") return;
    const href = (el.getAttribute("href") || "").split("?")[0];
    if (STATIC_ICON_HREFS.has(href)) {
      el.remove();
    }
  });
}

function clearManagedIconLinks() {
  document.querySelectorAll(`link[${MANAGED_ICON_ATTR}]`).forEach((el) => el.remove());
}

function applyFaviconHref(href) {
  if (!href) return;

  clearManagedIconLinks();
  removeStaticDefaultIconLinks();

  const isSvg = /\.svg(\?|#|$)/i.test(href);
  for (const rel of ["icon", "shortcut icon"]) {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    link.setAttribute(MANAGED_ICON_ATTR, "true");
    if (isSvg) {
      link.type = "image/svg+xml";
    }
    document.head.appendChild(link);
  }
}

/**
 * Aplica favicon, theme-color y variables CSS `--mp-primary` / `--mp-secondary`
 * según el workspace cargado desde `/api/workspace/current/`.
 */
export function WorkspaceBranding() {
  const { workspace, loading, workspaceStatus } = useWorkspace();

  useEffect(() => {
    const root = document.documentElement;
    const primary = sanitizeHex(workspace?.primary_color, DEFAULT_PRIMARY);
    const secondary = sanitizeHex(workspace?.secondary_color, DEFAULT_SECONDARY);
    root.style.setProperty("--mp-primary", primary);
    root.style.setProperty("--mp-secondary", secondary);

    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", primary);
  }, [workspace, loading]);

  useEffect(() => {
    if (loading || workspaceStatus === "loading") return;

    const tenantHref = resolveTenantFaviconHref(workspace);
    applyFaviconHref(tenantHref || NEUTRAL_FAVICON_HREF);
  }, [workspace, loading, workspaceStatus]);

  return null;
}

function sanitizeHex(input, fallback) {
  if (input == null || typeof input !== "string") return fallback;
  let s = input.trim();
  if (!s) return fallback;
  if (!s.startsWith("#")) s = `#${s}`;
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return fallback;
  return s;
}

"use client";

import { useEffect, useRef } from "react";

import { useWorkspace } from "@/context/WorkspaceContext";
import { normalizeMediaUrlForUi } from "@/lib/mediaUrls";

const DEFAULT_PRIMARY = "#0c9dcf";
const DEFAULT_SECONDARY = "#ea580c";

function sanitizeHex(input, fallback) {
  if (input == null || typeof input !== "string") return fallback;
  let s = input.trim();
  if (!s) return fallback;
  if (!s.startsWith("#")) s = `#${s}`;
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return fallback;
  return s;
}

/**
 * Aplica favicon, theme-color y variables CSS `--mp-primary` / `--mp-secondary`
 * según el workspace cargado desde `/api/workspace/current/`.
 */
export function WorkspaceBranding() {
  const { workspace, loading } = useWorkspace();
  const defaultIconHrefRef = useRef(null);

  useEffect(() => {
    if (loading) return;

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

    const iconLink = document.querySelector('link[rel="icon"]');
    if (defaultIconHrefRef.current == null && iconLink?.href) {
      defaultIconHrefRef.current = iconLink.href;
    }
    const fallbackIcon = defaultIconHrefRef.current || "/icon.svg";

    if (workspace?.favicon_url) {
      const href = normalizeMediaUrlForUi(workspace.favicon_url);
      if (href) {
        if (iconLink) {
          iconLink.setAttribute("href", href);
        } else {
          const link = document.createElement("link");
          link.rel = "icon";
          link.href = href;
          document.head.appendChild(link);
        }
      }
    } else if (iconLink) {
      iconLink.setAttribute("href", fallbackIcon);
    }
  }, [workspace, loading]);

  return null;
}

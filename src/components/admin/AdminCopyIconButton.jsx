"use client";

import { useCallback, useState } from "react";

function IconClipboard({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 5.5H6.5A1.5 1.5 0 0 0 5 7v12A1.5 1.5 0 0 0 6.5 20.5h11A1.5 1.5 0 0 0 19 19v-1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 5.5V4a1.5 1.5 0 0 1 1.5-1.5h5.06a1.5 1.5 0 0 1 1.06.44l2.94 2.94a1.5 1.5 0 0 1 .44 1.06V16a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 16V7A1.5 1.5 0 0 1 9 5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Botón compacto para copiar texto (listados admin). No renderiza si `value` está vacío.
 */
export function AdminCopyIconButton({ value, ariaLabel }) {
  const [copied, setCopied] = useState(false);
  const text = typeof value === "string" ? value.trim() : "";
  const canCopy = text.length > 0;

  const onClick = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!canCopy) return;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        /* sin fallback: permisos o contexto no seguro */
      }
    },
    [canCopy, text],
  );

  if (!canCopy) return null;

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_40%,transparent)]"
        aria-label={copied ? "Copiado al portapapeles" : ariaLabel || "Copiar al portapapeles"}
        title={copied ? "Copiado!" : "Copiar"}
      >
        <IconClipboard className="h-4 w-4" />
      </button>
      {copied ? (
        <span className="text-xs font-semibold text-emerald-700" role="status" aria-live="polite">
          Copiado!
        </span>
      ) : null}
    </span>
  );
}

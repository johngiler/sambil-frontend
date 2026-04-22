"use client";

import { useEffect, useRef, useState } from "react";

import { IconClose } from "@/components/layout/navIcons";
import {
  marketplacePrimaryBtn,
  marketplaceSecondaryBtn,
} from "@/lib/marketplaceActionButtons";

const dangerConfirmBtnClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[15px] bg-gradient-to-r from-red-600 via-red-600 to-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/45 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Diálogo de alerta o confirmación (sustituye `window.alert` y `window.confirm`).
 * Estilo alineado con la cuenta cliente / marketplace (no usar diálogos nativos del navegador).
 * Si no pasas `onConfirm`, solo se muestra el botón principal y cierra al pulsarlo.
 */
export function CustomAlert({
  open,
  onClose,
  title,
  children,
  onConfirm,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  destructive = false,
  labelledById = "custom-alert-title",
}) {
  const panelRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const isConfirm = typeof onConfirm === "function";

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, busy]);

  useEffect(() => {
    if (open && panelRef.current) {
      const el = panelRef.current.querySelector("button");
      el?.focus?.();
    }
  }, [open]);

  async function handlePrimary() {
    if (!isConfirm) {
      onClose();
      return;
    }
    setBusy(true);
    try {
      await Promise.resolve(onConfirm());
      onClose();
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const primaryClass = destructive ? dangerConfirmBtnClass : `${marketplacePrimaryBtn} px-5 py-2.5 text-sm font-semibold`;

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="Cerrar"
        disabled={busy}
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        className="relative z-10 flex max-h-[min(92dvh,880px)] w-full max-w-md flex-col overflow-hidden rounded-[15px] border border-zinc-200/90 bg-white shadow-2xl shadow-slate-900/20"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 py-4 pl-5 pr-1.5">
          <h2 id={labelledById} className="min-w-0 pr-2 text-lg font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            className="-mr-0.5 shrink-0 rounded-[10px] p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-50"
            aria-label="Cerrar ventana"
            disabled={busy}
            onClick={onClose}
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-zinc-700">
          {children}
        </div>
        <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/80 px-5 py-4">
          <div className="flex flex-wrap justify-end gap-2">
            {isConfirm ? (
              <>
                <button
                  type="button"
                  className={`${marketplaceSecondaryBtn} px-4 py-2.5 text-sm font-semibold`}
                  disabled={busy}
                  onClick={onClose}
                >
                  {cancelLabel}
                </button>
                <button type="button" className={primaryClass} disabled={busy} onClick={() => void handlePrimary()}>
                  {busy ? "Procesando…" : confirmLabel}
                </button>
              </>
            ) : (
              <button type="button" className={primaryClass} disabled={busy} onClick={() => void handlePrimary()}>
                {confirmLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

import { AdminModal } from "@/components/admin/AdminModal";
import { adminSecondaryBtn } from "@/components/admin/adminFormStyles";

/** Botón de acción destructiva (eliminar, revocar, etc.). */
const adminDangerBtn =
  "inline-flex items-center justify-center gap-2 rounded-[15px] bg-gradient-to-r from-red-600 via-red-600 to-red-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/45 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

/**
 * Diálogo de confirmación (sustituye `confirm()` nativo).
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.title
 * @param {import('react').ReactNode} props.children — cuerpo del mensaje (texto o párrafos).
 * @param {string} [props.confirmLabel]
 * @param {string} [props.cancelLabel]
 * @param {() => void | Promise<void>} props.onConfirm
 */
export function AdminConfirmDialog({
  open,
  onClose,
  title,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
}) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await Promise.resolve(onConfirm());
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      canClose={!busy}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className={adminSecondaryBtn}
            disabled={busy}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button type="button" className={adminDangerBtn} disabled={busy} onClick={() => void handleConfirm()}>
            {busy ? "Procesando…" : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="text-sm leading-relaxed text-zinc-700">{children}</div>
    </AdminModal>
  );
}

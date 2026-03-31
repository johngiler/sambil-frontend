"use client";

import { adminSecondaryBtn } from "@/components/admin/adminFormStyles";

/** Tamaño de página por defecto del API (debe coincidir con el backend). */
export const ADMIN_LIST_PAGE_SIZE = 20;

/**
 * @param {object} props
 * @param {number} props.page — 1-based
 * @param {number} props.totalCount
 * @param {(p: number) => void} props.onPageChange
 * @param {number} [props.pageSize]
 */
export function AdminListPagination({ page, totalCount, onPageChange, pageSize: pageSizeProp }) {
  const pageSize = pageSizeProp ?? ADMIN_LIST_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalCount === 0) return null;
  if (totalPages <= 1) {
    return (
      <p className="mt-4 text-sm text-zinc-500">
        {totalCount === 1 ? "1 resultado" : `${totalCount} resultados`}
      </p>
    );
  }
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-600">
        Página <span className="tabular-nums font-semibold text-zinc-800">{page}</span> de{" "}
        <span className="tabular-nums font-semibold text-zinc-800">{totalPages}</span>
        <span className="text-zinc-500">
          {" "}
          ({totalCount} {totalCount === 1 ? "resultado" : "resultados"})
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={adminSecondaryBtn}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className={adminSecondaryBtn}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

"use client";

import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/** Tamaño de página por defecto del API (debe coincidir con el backend). */
export const ADMIN_LIST_PAGE_SIZE = 20;

function ChevronLeft({ className = "" }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight({ className = "" }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Lista de números de página con elipsis (máx. compacto en pantallas angostas).
 * @param {number} current
 * @param {number} total
 * @returns {(number | "gap")[]}
 */
function pageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("gap");
    out.push(sorted[i]);
  }
  return out;
}

const navBtnBase = `mp-pagination-focus inline-flex min-h-10 min-w-10 items-center justify-center ${ROUNDED_CONTROL} border border-zinc-200/90 bg-white text-sm font-medium text-zinc-700 shadow-sm shadow-zinc-900/[0.04] transition-[border-color,background-color,color,box-shadow,transform] duration-200 ease-out hover:border-[color-mix(in_srgb,var(--mp-primary)_35%,#e4e4e7)] hover:bg-[color-mix(in_srgb,var(--mp-primary)_6%,#fff)] hover:text-zinc-900 active:scale-[0.97] focus-visible:outline-none disabled:pointer-events-none disabled:border-zinc-100 disabled:bg-zinc-50 disabled:text-zinc-300 disabled:shadow-none`;

const pagePillBase = `inline-flex min-h-10 min-w-10 items-center justify-center ${ROUNDED_CONTROL} border text-sm font-semibold tabular-nums transition-[border-color,background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.96]`;

const pagePillInactive = `mp-pagination-focus ${pagePillBase} border-transparent bg-transparent text-zinc-600 hover:border-zinc-200/80 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none`;

const pagePillActive = `mp-pagination-focus ${pagePillBase} border-[color-mix(in_srgb,var(--mp-primary)_52%,var(--mp-secondary)_18%)] bg-[color-mix(in_srgb,var(--mp-primary)_10%,color-mix(in_srgb,var(--mp-secondary)_5%,#fff))] text-zinc-900 shadow-sm shadow-[color-mix(in_srgb,var(--mp-primary)_12%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--mp-secondary)_22%,color-mix(in_srgb,var(--mp-primary)_14%,transparent))] focus-visible:outline-none`;

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

  const slots = pageNumbers(page, totalPages);

  return (
    <div
      className={`mt-6 flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white px-4 py-3.5 shadow-sm shadow-zinc-900/[0.04] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-4`}
    >
      <div className="min-w-0">
        <p className="text-sm text-zinc-600">
          Página{" "}
          <span className="tabular-nums font-semibold text-zinc-900">{page}</span>
          {" de "}
          <span className="tabular-nums font-semibold text-zinc-900">{totalPages}</span>
          <span className="text-zinc-500">
            {" "}
            · {totalCount} {totalCount === 1 ? "resultado" : "resultados"}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-1.5 sm:justify-end">
        <button
          type="button"
          className={`${navBtnBase} px-2 sm:px-2.5`}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="sm:mr-1" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex flex-wrap items-center gap-1 px-0.5" role="navigation" aria-label="Números de página">
          {slots.map((item, idx) =>
            item === "gap" ? (
              <span
                key={`gap-${idx}`}
                className="inline-flex min-w-8 select-none items-center justify-center px-0.5 text-sm font-medium text-zinc-400"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={item === page ? pagePillActive : pagePillInactive}
                onClick={() => onPageChange(item)}
                aria-label={`Ir a la página ${item}`}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className={`${navBtnBase} px-2 sm:px-2.5`}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="sm:ml-1" />
        </button>
      </div>
    </div>
  );
}

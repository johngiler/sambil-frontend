"use client";

import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/** Texto vacío legible en paneles de detalle del acordeón. */
export function adminDetailEmpty(text) {
  const t = text?.trim?.() ?? "";
  if (t) return t;
  return <span className="text-sm text-zinc-400">Sin información</span>;
}

/** Fila de tabla: celda de panel expandido + tarjeta interior (acordeón). */
export function AdminAccordionRowPanel({ colSpan, panelId, children, fullWidthContent = false }) {
  return (
    <tr className="border-b border-zinc-100">
      <td
        colSpan={colSpan}
        className="bg-zinc-50/90 p-4 sm:p-5"
        id={panelId}
        role="region"
      >
        <div
          className={`mx-auto w-full ${fullWidthContent ? "" : "max-w-5xl"} ${ROUNDED_CONTROL} border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-100/70 sm:p-6`}
        >
          {children}
        </div>
      </td>
    </tr>
  );
}

/**
 * @param {string} [badgeText] — opcional; vacío u omitido = sin pastilla
 * @param {string} [titleLabel]
 * @param {React.ReactNode} titleLine — texto principal junto al badge
 * @param {string} [hint] — esquina derecha en sm+
 */
export function AdminAccordionDetailHeader({ badgeText, titleLabel, titleLine, hint }) {
  const showBadge = badgeText != null && String(badgeText).trim() !== "";
  return (
    <header className="flex flex-col gap-3 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {showBadge ? (
          <span className="inline-flex items-center rounded-[10px] bg-zinc-900 px-3 py-1.5 font-mono text-sm font-semibold text-white tabular-nums">
            {badgeText}
          </span>
        ) : null}
        <div className="min-w-0">
          {titleLabel ? (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{titleLabel}</p>
          ) : null}
          {typeof titleLine === "string" ? (
            <p className="truncate text-sm font-medium text-zinc-900">{titleLine}</p>
          ) : (
            titleLine
          )}
        </div>
      </div>
      {hint ? <p className="text-xs text-zinc-500 sm:text-right">{hint}</p> : null}
    </header>
  );
}

export function AdminDetailSection({ panelId, sectionId, title, children }) {
  const sid = `${panelId}-${sectionId}`;
  return (
    <section className="space-y-4" aria-labelledby={sid}>
      <h3
        id={sid}
        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0b7aa8]"
      >
        <span className="mp-bg-dot-brand h-2 w-2 shrink-0 rounded-full" aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  );
}

export function AdminDetailInset({ className = "", children }) {
  return (
    <div className={`space-y-4 rounded-[12px] bg-zinc-50/80 p-4 ring-1 ring-zinc-100/80 ${className}`}>
      {children}
    </div>
  );
}

export function AdminDetailField({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-zinc-800">{children}</div>
    </div>
  );
}

/** Caja ancha para párrafos largos (descripción, notas). */
export function AdminDetailProse({ text, emptyHint }) {
  const t = text?.trim();
  return (
    <div className="mt-3 min-h-[3rem] rounded-[12px] bg-zinc-50/60 p-4 text-sm leading-relaxed text-zinc-700 ring-1 ring-zinc-100/80">
      {t ? <p className="whitespace-pre-wrap">{t}</p> : <p className="text-zinc-400">{emptyHint}</p>}
    </div>
  );
}

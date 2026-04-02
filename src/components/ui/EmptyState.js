/**
 * Estado vacío con icono grande, título y descripción (patrón “empty state”).
 * Textos visibles: lenguaje claro para personas que no son técnicas (sin mencionar API, endpoints, etc.).
 */

import { ROUNDED_CONTROL } from "@/lib/uiRounding";

const stroke = {
  strokeWidth: 1.35,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function IconBox({ children, className = "" }) {
  return (
    <div
      className={`flex size-[5.5rem] shrink-0 items-center justify-center ${ROUNDED_CONTROL} bg-gradient-to-b from-zinc-100 to-zinc-50 text-zinc-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] ring-1 ring-zinc-200/80 [&_svg]:size-[3.25rem] ${className}`}
      aria-hidden
    >
      {children}
    </div>
  );
}

export function EmptyStateIconBuilding() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...stroke}>
      <path d="M3 21h18M5 21V10l7-4 7 4v11M9 21v-5h6v5" />
    </svg>
  );
}

export function EmptyStateIconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...stroke}>
      <path d="M4 5.5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0110 5.5v3A1.5 1.5 0 018.5 10h-3A1.5 1.5 0 014 8.5v-3zM14 5.5a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 0114 8.5v-3zM4 15.5a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3A1.5 1.5 0 018.5 20h-3A1.5 1.5 0 014 18.5v-3zM14 15.5a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5v-3z" />
    </svg>
  );
}

export function EmptyStateIconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...stroke}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

export function EmptyStateIconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...stroke}>
      <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v6" />
    </svg>
  );
}

export function EmptyStateIconClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...stroke}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h6m-6 4h4" />
    </svg>
  );
}

export function EmptyStateIconCart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...stroke}>
      <path d="M16 11V7a4 4 0 10-8 0v4M5 9h14l-1 12H6L5 9zm4 5h.01M15 14h.01" />
    </svg>
  );
}

export function EmptyStateIconPhoto() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...stroke}>
      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export function EmptyStateIconSearchOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...stroke}>
      <path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0zM3 3l18 18" />
    </svg>
  );
}

export function EmptyStateIconInbox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...stroke}>
      <path d="M4 13a2 2 0 002 2h12a2 2 0 002-2V8H4v5zm2-5V6a2 2 0 012-2h8a2 2 0 012 2v2M9 13h6" />
    </svg>
  );
}

export function EmptyState({ icon, title, description, action, className = "" }) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center ${ROUNDED_CONTROL} border border-dashed border-zinc-200/95 bg-gradient-to-b from-zinc-50/95 via-white to-zinc-50/40 px-6 py-14 text-center sm:px-10 ${className}`}
    >
      <IconBox>{icon}</IconBox>
      <h3 className="mt-6 max-w-md text-base font-semibold tracking-tight text-zinc-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">{description}</p>
      ) : null}
      {action ? <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{action}</div> : null}
    </div>
  );
}

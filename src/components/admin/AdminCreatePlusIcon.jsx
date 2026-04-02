/** Icono + para botones «Nuevo …» — alineación estable frente al texto (el carácter + suele verse alto). */
export function AdminCreatePlusIcon({ className = "" }) {
  return (
    <span
      className={`inline-flex size-5 shrink-0 items-center justify-center self-center ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[1.125rem] sm:size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
  );
}

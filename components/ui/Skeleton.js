import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/** Bloque animado para estados de carga. */
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse ${ROUNDED_CONTROL} bg-zinc-200/80 ${className}`}
      {...props}
    />
  );
}

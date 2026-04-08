import { Skeleton } from "@/components/ui/Skeleton";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/**
 * Misma estructura que una fila colapsada en `MisPedidosView` (referencia, estado, líneas, importes, chevron).
 */
export function MisPedidosSkeleton() {
  return (
    <ul className="mt-10 space-y-4" aria-busy="true" aria-label="Cargando pedidos">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className={`${ROUNDED_CONTROL} overflow-hidden border border-zinc-200/90 bg-white shadow-sm`}
        >
          <div className="flex w-full items-start justify-between gap-4 px-4 py-5 sm:px-6">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex flex-wrap items-start justify-between gap-3 border-t border-zinc-100 pt-3">
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-full max-w-xs" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-7 w-20 shrink-0" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-7 w-24 shrink-0" />
              </div>
            </div>
            <Skeleton className="mt-1 h-6 w-6 shrink-0 rounded-md" />
          </div>
        </li>
      ))}
    </ul>
  );
}

import { Skeleton } from "@/components/ui/Skeleton";

/** Replica encabezado al aire (sin tarjeta), búsqueda píldora, pills y rejilla (gap 10px). */
export function HomeSpacesCatalogSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando espacios">
      <div className="space-y-8">
        <div className="-mx-4 rounded-2xl px-4 py-7 sm:-mx-6 sm:rounded-3xl sm:px-6 sm:py-9 lg:-mx-8 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-9 w-[min(18rem,85vw)] rounded-full bg-zinc-200/60" />
            <Skeleton className="h-10 w-full max-w-md rounded-md bg-zinc-200/50" />
            <Skeleton className="h-4 w-full max-w-lg bg-zinc-200/50" />
          </div>
        </div>
        <div className="space-y-5">
          <Skeleton className="h-12 w-full max-w-5xl rounded-full" />
          <div className="flex max-w-5xl gap-2 overflow-hidden pb-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-[5.5rem] shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      <Skeleton className="h-4 w-56" />
      <ul className="grid list-none gap-[10px] p-0 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i}>
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-zinc-200/80">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 px-4 py-4">
                <div className="flex justify-between gap-2">
                  <Skeleton className="h-5 w-[55%]" />
                  <Skeleton className="h-5 w-16 shrink-0" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="mt-3 h-2 w-full rounded-sm" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

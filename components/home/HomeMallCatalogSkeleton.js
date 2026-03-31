import { Skeleton } from "@/components/ui/Skeleton";

/** Replica la portada del catálogo de centros: texto intro, panel de filtros y rejilla de tarjetas. */
export function HomeMallCatalogSkeleton() {
  return (
    <div className="mt-10 space-y-8" aria-busy="true" aria-label="Cargando centros">
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>

      <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <Skeleton className="h-11 w-full max-w-xl rounded-xl" />
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <div>
              <Skeleton className="mb-2 h-3 w-16" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-36 rounded-full" />
              </div>
            </div>
            <div>
              <Skeleton className="mb-2 h-3 w-20" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-16 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-32 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Skeleton className="h-4 w-48" />
      <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <div className="overflow-hidden rounded-[1.25rem] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-zinc-200/90">
              <Skeleton className="aspect-[5/4] w-full rounded-none sm:aspect-[4/3]" />
              <div className="space-y-2 border-t border-zinc-100 px-4 py-4 sm:px-5 sm:py-5">
                <Skeleton className="h-5 w-[80%]" />
                <Skeleton className="h-4 w-[60%]" />
                <Skeleton className="h-4 w-[45%]" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Skeleton } from "@/components/ui/Skeleton";

/** Réplica del home catálogo: hero, búsqueda + Filtros, tarjetas sin descripción. */
export function HomeSpacesCatalogSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5" aria-busy="true" aria-label="Cargando espacios">
      <section className="space-y-4 sm:space-y-5">
        <div className="-mx-4 rounded-2xl px-4 pb-3 pt-5 sm:-mx-6 sm:rounded-3xl sm:px-6 sm:pb-4 sm:pt-6 lg:-mx-8 lg:px-8">
          <header className="max-w-3xl space-y-4">
            <Skeleton className="h-9 w-[min(14rem,70vw)] rounded-full bg-zinc-200/60" />
            <Skeleton className="h-9 w-[min(18rem,85vw)] sm:h-10" />
            <Skeleton className="h-4 w-full max-w-lg bg-zinc-200/50" />
          </header>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-stretch gap-2 sm:gap-3">
            <Skeleton className="min-h-12 min-w-0 flex-1 rounded-full sm:min-h-11" />
            <Skeleton className="h-12 w-[5.75rem] shrink-0 rounded-full sm:h-11 sm:w-24" />
          </div>
        </div>
      </section>

      <ul className="grid list-none gap-[10px] p-0 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i}>
            <article className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-zinc-200/80">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="p-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="mt-1 h-3 w-16 rounded-sm" />
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="mt-4 h-2.5 w-full rounded-md" />
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

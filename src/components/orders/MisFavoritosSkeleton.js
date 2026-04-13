import { Skeleton } from "@/components/ui/Skeleton";

/** Misma rejilla y envoltura de tarjeta que el catálogo inicio (`HomeSpacesCatalogSkeleton`). */
export function MisFavoritosSkeleton() {
  return (
    <ul className="grid list-none gap-[10px] p-0 grid-cols-1 sm:grid-cols-2 md:grid-cols-3" aria-busy="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <li key={i}>
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-zinc-200/80">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-2 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-5 min-w-0 flex-1" />
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[70%]" />
              <Skeleton className="mt-3 h-2 w-full rounded-sm" />
              <Skeleton className="mt-3 h-2 w-full rounded-sm" />
              <Skeleton className="mt-3 h-10 w-full rounded-lg" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

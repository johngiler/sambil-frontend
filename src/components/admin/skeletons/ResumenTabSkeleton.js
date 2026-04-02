import { Skeleton } from "@/components/ui/Skeleton";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/** Misma estructura que `ResumenTab`: bloque KPI + rejilla de 5 tarjetas. */
export function ResumenTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className={`${ROUNDED_CONTROL} border border-dashed border-zinc-200 bg-zinc-50/80 p-5`}>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-3 h-3 w-full max-w-xl" />
        <Skeleton className="mt-2 h-3 w-full max-w-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`${ROUNDED_CONTROL} border border-zinc-200 bg-white p-4 shadow-sm`}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

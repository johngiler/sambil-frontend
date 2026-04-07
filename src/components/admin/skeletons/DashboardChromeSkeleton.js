import { Skeleton } from "@/components/ui/Skeleton";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/** Título y descripción del panel (misma zona que `DashboardView`). */
export function DashboardChromeSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Skeleton className="h-9 w-56 max-w-full sm:h-10 sm:w-64" />
        <Skeleton className="h-9 w-52 max-w-full rounded-full sm:h-10 sm:w-56" />
      </div>
      <div className="mt-8 space-y-4">
        <Skeleton className={`h-32 w-full ${ROUNDED_CONTROL}`} />
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/Skeleton";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/** Misma estructura que `ResumenTab`: KPI + gráficos + actividad reciente al final. */
export function ResumenTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`${ROUNDED_CONTROL} border border-zinc-200/80 bg-gradient-to-br from-zinc-100/90 to-white p-4 shadow-sm`}
          >
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="size-11 shrink-0 rounded-xl" />
            </div>
            <Skeleton className="mt-3 h-9 w-14" />
          </div>
        ))}
      </div>

      <div className="space-y-5">
        <div
          className={`${ROUNDED_CONTROL} border border-zinc-200/90 bg-gradient-to-br from-zinc-50 to-zinc-100/80 p-4 sm:p-6`}
        >
          <Skeleton className="h-4 w-56" />
          <Skeleton className="mt-2 h-3 w-72 max-w-full" />
          <Skeleton className="mt-6 h-[220px] w-full rounded-xl sm:h-[260px]" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {[0, 1].map((j) => (
            <div key={j} className={`${ROUNDED_CONTROL} border border-zinc-200 bg-white p-4 shadow-sm sm:p-5`}>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-52 max-w-full" />
              <Skeleton className="mx-auto mt-4 size-[180px] rounded-full" />
              <Skeleton className="mx-auto mt-4 h-8 w-48" />
            </div>
          ))}
        </div>

        <div className={`${ROUNDED_CONTROL} border border-zinc-200 bg-white p-4 shadow-sm sm:p-5`}>
          <Skeleton className="h-4 w-56" />
          <Skeleton className="mt-2 h-3 w-72 max-w-full" />
          <Skeleton className="mt-4 h-[160px] w-full rounded-xl" />
        </div>
      </div>

      <div
        className={`${ROUNDED_CONTROL} border border-zinc-200/90 bg-gradient-to-br from-zinc-50/90 via-white to-violet-50/20 p-4 sm:p-5`}
      >
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-2 h-3 w-full max-w-lg" />
        <ul className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, k) => (
            <li
              key={k}
              className={`flex gap-3 rounded-xl border border-zinc-100/90 bg-white/70 p-3 ${ROUNDED_CONTROL}`}
            >
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="h-3 w-52" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

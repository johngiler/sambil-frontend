import { Skeleton } from "@/components/ui/Skeleton";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

function Bar() {
  return <div className="h-4 w-full animate-pulse rounded bg-zinc-200/80" />;
}

export function MisContratosSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando contratos">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${ROUNDED_CONTROL} border border-zinc-200/90 bg-zinc-50/80 p-4`}>
          <Bar />
          <div className="mt-3 h-8 w-28 animate-pulse rounded bg-zinc-200/70" />
        </div>
        <div className={`${ROUNDED_CONTROL} border border-zinc-200/90 bg-zinc-50/80 p-4`}>
          <Bar />
          <div className="mt-3 h-8 w-20 animate-pulse rounded bg-zinc-200/70" />
        </div>
        <div className={`${ROUNDED_CONTROL} border border-zinc-200/90 bg-zinc-50/80 p-4`}>
          <Bar />
          <div className="mt-3 h-8 w-16 animate-pulse rounded bg-zinc-200/70" />
        </div>
      </div>
      <div
        className={`group overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)]`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-[color-mix(in_srgb,var(--mp-primary)_55%,transparent)] via-[color-mix(in_srgb,var(--mp-secondary)_40%,transparent)] to-amber-200/80" />
        <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-6 sm:gap-y-4 sm:p-5">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-16 rounded bg-zinc-200/70" />
              <Skeleton className="h-10 w-full max-w-md rounded-xl bg-zinc-200/60" />
            </div>
            <div className="w-full min-w-[min(100%,220px)] space-y-2 sm:w-auto sm:min-w-[220px]">
              <Skeleton className="h-3 w-14 rounded bg-zinc-200/70" />
              <Skeleton className="h-10 w-full rounded-xl bg-zinc-200/60" />
            </div>
            <div className="flex w-full flex-col justify-end sm:w-auto">
              <Skeleton className="mb-2 hidden h-3 w-8 sm:block" aria-hidden />
              <Skeleton className="h-10 w-full rounded-full bg-zinc-200/50 sm:w-36" />
            </div>
          </div>
        </div>
      </div>
      <div className={`space-y-3 ${ROUNDED_CONTROL} border border-zinc-200/90 p-4`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 border-b border-zinc-100 pb-4 last:border-0">
            <div className="h-16 w-20 shrink-0 animate-pulse rounded-lg bg-zinc-200/70" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bar />
              <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-200/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

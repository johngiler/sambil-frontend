import { Skeleton } from "@/components/ui/Skeleton";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/** Misma estructura que la tabla de contratos en `ContratosAdminSection`. */
export function ContratosSectionSkeleton() {
  return (
    <div className={`overflow-x-auto ${ROUNDED_CONTROL} border border-zinc-200`}>
      <table className="min-w-[56rem] text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
          <tr>
            <th className="w-10 px-2 py-3" aria-hidden />
            <th className="w-16 px-2 py-3" aria-hidden />
            <th className="min-w-[10rem] px-3 py-3">
              <Skeleton className="h-3 w-14" />
            </th>
            <th className="min-w-[8rem] px-3 py-3">
              <Skeleton className="h-3 w-16" />
            </th>
            <th className="min-w-[12rem] px-3 py-3">
              <Skeleton className="h-3 w-20" />
            </th>
            <th className="min-w-[14rem] px-3 py-3">
              <Skeleton className="h-3 w-24" />
            </th>
            <th className="min-w-[6rem] px-3 py-3">
              <Skeleton className="h-3 w-16" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-t border-zinc-100">
              <td className="px-2 py-2">
                <Skeleton className={`h-8 w-8 ${ROUNDED_CONTROL}`} />
              </td>
              <td className="px-2 py-2">
                <Skeleton className={`h-12 w-12 ${ROUNDED_CONTROL}`} />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-24" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-6 w-full max-w-[14rem]" />
                <Skeleton className="mt-2 h-2 w-full max-w-[14rem]" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

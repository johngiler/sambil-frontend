import { Skeleton } from "@/components/ui/Skeleton";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/** Misma estructura que la tabla de pedidos en `PedidosAdminSection`. */
export function PedidosSectionSkeleton() {
  return (
    <div className={`overflow-x-auto ${ROUNDED_CONTROL} border border-zinc-200`}>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
          <tr>
            <th className="w-10 px-2 py-3" aria-hidden />
            <th className="px-3 py-3">
              <Skeleton className="h-3 w-14" />
            </th>
            <th className="px-3 py-3">
              <Skeleton className="h-3 w-16" />
            </th>
            <th className="px-3 py-3">
              <Skeleton className="h-3 w-20" />
            </th>
            <th className="px-3 py-3">
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
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-36" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className={`h-9 w-28 ${ROUNDED_CONTROL}`} />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-16" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

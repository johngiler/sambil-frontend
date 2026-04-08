import Image from "next/image";
import Link from "next/link";

import { SpaceMonthAvailabilityBar } from "@/components/catalog/SpaceMonthAvailabilityBar";
import { spaceStatusLabel, spaceStatusPillClassName } from "@/components/admin/adminConstants";
import { IconCart } from "@/components/layout/navIcons";
import { spaceCoverUrlForUi } from "@/lib/spaceCover";

function formatUsdMonthly(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(x);
}

/**
 * Tarjeta de toma en catálogo de centro (precio acento, badge ciudad, franja de 12 meses).
 * @param {{ space: Record<string, unknown>, availabilityLabel?: "free" | "occupied", showFooterLink?: boolean, inCart?: boolean }} props
 */
export function SpaceCard({ space, availabilityLabel = "free", showFooterLink = true, inCart = false }) {
  const cover = spaceCoverUrlForUi(space);
  const cityRaw =
    typeof space.shopping_center_city === "string" && space.shopping_center_city.trim() !== ""
      ? space.shopping_center_city.trim()
      : typeof space.shopping_center_name === "string"
        ? space.shopping_center_name
        : "";
  const city = cityRaw;
  const statusText = spaceStatusLabel(space.status, space.status_label);
  const desc =
    typeof space.description === "string" && space.description.trim() !== ""
      ? space.description.trim()
      : typeof space.venue_zone === "string" && space.venue_zone.trim() !== ""
        ? space.venue_zone
        : typeof space.location_description === "string"
          ? space.location_description
          : typeof space.type === "string"
            ? space.type
            : "";

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-zinc-200/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.15)] hover:ring-zinc-300">
      <Link
        href={`/catalog/${space.id}`}
        className="mp-ring-brand block rounded-2xl focus-visible:outline-none"
      >
        <div className="relative aspect-[4/3] bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900">
          {cover ? (
            <Image
              src={cover}
              alt={typeof space.title === "string" ? space.title : "Espacio publicitario"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(217,142,50,0.2),transparent_55%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </>
          )}
          {city ? (
            <span className="absolute left-3 top-3 rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              {city}
            </span>
          ) : null}
          {inCart ? (
            <span className="absolute right-2.5 top-2.5 inline-flex max-w-[min(100%-4rem,9.5rem)] items-center gap-1 rounded-full bg-[var(--mp-secondary)] px-2.5 py-1 text-[10px] font-semibold leading-tight text-white shadow-[0_2px_10px_rgba(234,88,12,0.45)] ring-1 ring-white/35">
              <IconCart className="h-3 w-3 shrink-0 text-white" aria-hidden />
              <span className="truncate">En carrito</span>
            </span>
          ) : null}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 flex-1 break-words text-[17px] font-semibold leading-snug tracking-tight text-zinc-900">
              {space.title}
            </h2>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-tight ${spaceStatusPillClassName(space.status)}`}
              >
                {statusText}
              </span>
              <p className="text-right text-lg font-bold tabular-nums text-[#c2410c]">
                {formatUsdMonthly(space.monthly_price_usd)}
              </p>
            </div>
          </div>
          {desc ? (
            <p className="mt-1.5 line-clamp-2 break-words text-sm text-zinc-500">{desc}</p>
          ) : null}
          <div className="mt-4">
            <SpaceMonthAvailabilityBar
              monthsOccupied={space.months_occupied}
              labelMetric={availabilityLabel}
            />
          </div>
          {showFooterLink ? (
            <span className="mt-3 inline-block text-sm font-semibold text-zinc-800 no-underline underline-offset-4 group-hover:underline">
              Ver detalle
            </span>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

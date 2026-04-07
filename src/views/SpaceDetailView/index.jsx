import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SpaceMonthAvailabilityBar } from "@/components/catalog/SpaceMonthAvailabilityBar";
import { SpaceDetailReservationActions } from "@/components/catalog/SpaceDetailReservationActions";
import { SPACE_TYPES, spaceStatusLabel } from "@/components/admin/adminConstants";
import { spaceCoverUrlForUi } from "@/lib/spaceCover";
import { getSpace } from "@/services/api";

function labelFromChoices(choices, value) {
  if (value == null || String(value).trim() === "") return null;
  const v = String(value).trim();
  const row = choices.find((c) => c.v === v);
  return row?.l ?? v;
}

function formatUsdMonthly(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(x);
}

function SpecRow({ label, children }) {
  if (children == null || children === "") return null;
  return (
    <div className="border-b border-zinc-100 py-3 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1.5 min-w-0 break-words text-sm font-medium leading-relaxed text-zinc-900">{children}</dd>
    </div>
  );
}

export default async function SpaceDetailView({ spaceId }) {
  let space;
  try {
    space = await getSpace(spaceId);
  } catch {
    notFound();
  }

  if (space.catalog_public !== true) {
    notFound();
  }

  const backHref = "/";
  const typeLabel = labelFromChoices(SPACE_TYPES, space.type);
  const statusLabel = spaceStatusLabel(space.status, space.status_label);
  const year = Number(space.availability_year) || new Date().getFullYear();
  const city =
    typeof space.shopping_center_city === "string" && space.shopping_center_city.trim() !== ""
      ? space.shopping_center_city.trim()
      : null;
  const coverUrl = spaceCoverUrlForUi(space);
  const coverAlt =
    typeof space.title === "string" && space.title.trim() !== ""
      ? `Imagen principal: ${space.title.trim()}`
      : "Imagen principal del espacio publicitario";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <Link
        href={backHref}
        className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-500 transition-colors duration-200 hover:text-zinc-900 sm:min-h-0"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden>
          ←
        </span>
        <span>Volver al catálogo</span>
      </Link>

      <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="font-mono text-xs font-medium uppercase tracking-wider text-zinc-400">{space.code}</p>
          <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            {space.title}
          </h1>
          <p className="mt-3 text-base text-zinc-600">
            <span className="font-medium text-zinc-800">{space.shopping_center_name}</span>
            {city ? <span className="text-zinc-400"> · {city}</span> : null}
            {typeLabel ? (
              <>
                <span className="text-zinc-400"> · </span>
                <span>{typeLabel}</span>
              </>
            ) : null}
          </p>

          {coverUrl ? (
            <figure className="mt-8">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-100 shadow-sm ring-1 ring-zinc-200/60 sm:aspect-[16/9]">
                <Image
                  src={coverUrl}
                  alt={coverAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 520px"
                  priority
                />
              </div>
            </figure>
          ) : null}

          <div className="mt-8 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Precio mensual</p>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-3xl font-semibold tabular-nums text-[#c2410c] sm:text-4xl">
                {formatUsdMonthly(space.monthly_price_usd)}
              </span>
              <span className="text-sm text-zinc-500">USD / mes, antes de impuestos si aplican</span>
            </p>
            <div className="mt-5 border-t border-zinc-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Disponibilidad en {year}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Franja por meses: naranja = ocupado o bloqueado; gris claro = libre.
              </p>
              <div className="mt-3 max-w-lg">
                <SpaceMonthAvailabilityBar monthsOccupied={space.months_occupied} labelMetric="occupied" />
              </div>
            </div>
          </div>

          {space.description ? (
            <div className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Descripción</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-700 sm:text-base">{space.description}</p>
            </div>
          ) : null}
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-5 sm:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Ficha técnica</h2>
            <dl className="mt-2">
              {space.width != null && space.height != null ? (
                <SpecRow label="Dimensiones (m)">
                  {space.width} × {space.height}
                </SpecRow>
              ) : null}
              {space.material ? <SpecRow label="Material">{space.material}</SpecRow> : null}
              {space.location_description ? (
                <SpecRow label="Ubicación en el centro">{space.location_description}</SpecRow>
              ) : null}
              {space.venue_zone ? <SpecRow label="Zona comercial">{space.venue_zone}</SpecRow> : null}
              {space.level ? <SpecRow label="Nivel">{space.level}</SpecRow> : null}
              {space.quantity != null && Number(space.quantity) > 1 ? (
                <SpecRow label="Cantidad de unidades">{space.quantity}</SpecRow>
              ) : null}
              <SpecRow label="Estado">
                <span className="capitalize">{statusLabel}</span>
              </SpecRow>
            </dl>
          </div>
        </aside>
      </div>

      <SpaceDetailReservationActions space={space} />
    </div>
  );
}

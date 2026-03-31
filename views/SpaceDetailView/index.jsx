import Link from "next/link";
import { notFound } from "next/navigation";

import { SpaceDetailReservationActions } from "@/components/catalog/SpaceDetailReservationActions";
import { getSpace } from "@/services/api";

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

  const backHref = `/m/${space.shopping_center_code}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center text-sm font-medium text-zinc-500 transition-colors duration-200 ease-out hover:text-zinc-900 sm:min-h-0"
      >
        ← Espacios en este centro
      </Link>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:mt-6">
        {space.code}
      </p>
      <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
        {space.title}
      </h1>
      <p className="mt-2 break-words text-zinc-600">
        {space.shopping_center_name} · {space.type}
      </p>
      <p className="mt-6 flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold tabular-nums text-zinc-900 sm:text-3xl">
        <span>${space.monthly_price_usd}</span>
        <span className="text-base font-normal text-zinc-500">/ mes (USD)</span>
      </p>
      {space.description ? (
        <p className="mt-6 text-zinc-700">{space.description}</p>
      ) : null}
      <dl className="mt-8 grid gap-2 text-sm text-zinc-600">
        {space.width ? (
          <div>
            <dt className="font-medium text-zinc-900">Dimensions</dt>
            <dd>
              {space.width} × {space.height}
            </dd>
          </div>
        ) : null}
        {space.material ? (
          <div>
            <dt className="font-medium text-zinc-900">Material</dt>
            <dd>{space.material}</dd>
          </div>
        ) : null}
        {space.location_description ? (
          <div>
            <dt className="font-medium text-zinc-900">Location</dt>
            <dd>{space.location_description}</dd>
          </div>
        ) : null}
        {space.level ? (
          <div>
            <dt className="font-medium text-zinc-900">Level</dt>
            <dd>{space.level}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-medium text-zinc-900">Status</dt>
          <dd className="capitalize">{space.status}</dd>
        </div>
      </dl>
      <SpaceDetailReservationActions space={space} />
    </div>
  );
}

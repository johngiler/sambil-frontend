import Link from "next/link";

import { MallCardCover } from "@/components/mall/MallCardCover";

const cardShell =
  "relative overflow-hidden rounded-[1.25rem] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-zinc-200/90";

const enabledHover =
  "transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] hover:ring-zinc-300";

export function MallCard({ mall }) {
  const centerActive = mall.centerActive !== false;
  const catalogEnabled = Boolean(mall.catalogEnabled);
  const canReserve = centerActive && catalogEnabled;

  const media = (
    <div className="relative aspect-[5/4] overflow-hidden bg-zinc-100 sm:aspect-[4/3]">
      {mall.imageUrl ? (
        <MallCardCover
          imageUrl={mall.imageUrl}
          title={mall.title}
          placeholderClass={mall.placeholderClass}
          priority={mall.priorityCover === true}
        />
      ) : (
        <>
          <div
            className={`absolute inset-0 bg-gradient-to-br ${mall.placeholderClass ?? "from-zinc-600 to-zinc-400"}`}
            aria-hidden
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="absolute inset-0 bg-zinc-950/35 backdrop-blur-[0.5px]" aria-hidden />
        </>
      )}

      {!centerActive ? (
        <span className="absolute right-3 top-3 rounded-full border border-zinc-400/50 bg-zinc-800/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-50 shadow-sm ring-1 ring-zinc-600/40 backdrop-blur-sm">
          Inactivo
        </span>
      ) : !catalogEnabled ? (
        <span className="absolute right-3 top-3 rounded-full border border-orange-300/50 bg-gradient-to-r from-orange-100/95 to-amber-50/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-orange-950 shadow-sm ring-1 ring-orange-200/60 backdrop-blur-sm">
          Próximamente
        </span>
      ) : (
        <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-800 shadow-sm backdrop-blur-sm">
          Disponible
        </span>
      )}
    </div>
  );

  const footer = (
    <div className="border-t border-zinc-100 bg-white px-4 py-4 sm:px-5 sm:py-5">
      <h2 className="break-words text-base font-bold uppercase leading-snug tracking-wide text-zinc-900 sm:text-[17px]">
        {mall.title}
      </h2>
      <p className="mt-1.5 break-words text-sm font-medium text-zinc-500">{mall.subtitle}</p>
      {canReserve ? (
        <p className="mt-3 text-sm font-semibold text-[#2c2c81] transition group-hover:text-[#009ce0]">
          Ver espacios publicitarios →
        </p>
      ) : !centerActive ? (
        <p className="mt-3 text-sm text-zinc-400">Centro inactivo en el sistema</p>
      ) : (
        <p className="mt-3 text-sm text-zinc-400">Aún no disponible en el marketplace</p>
      )}
    </div>
  );

  const article = (
    <article
      className={`${cardShell} ${canReserve ? enabledHover : "opacity-[0.92] saturate-[0.85]"}`}
    >
      {media}
      {footer}
    </article>
  );

  if (canReserve && mall.code) {
    return (
      <Link
        href={`/m/${mall.code}`}
        className="group block outline-none focus-visible:ring-2 focus-visible:ring-[#009ce0] focus-visible:ring-offset-2"
      >
        {article}
      </Link>
    );
  }

  return (
    <div
      className="block cursor-not-allowed select-none"
      aria-disabled="true"
      title="Próximamente en el marketplace"
    >
      {article}
    </div>
  );
}

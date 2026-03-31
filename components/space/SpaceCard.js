import Link from "next/link";

export function SpaceCard({ space }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-zinc-200/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.15)] hover:ring-zinc-300">
      <Link
        href={`/catalog/${space.id}`}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009ce0] focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] bg-gradient-to-br from-[#2c2c81] via-[#5956a1] to-[#009ce0]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(248,184,0,0.25),transparent_55%)]" />
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
              {space.code}
            </p>
          </div>
        </div>
        <div className="p-4">
          <h2 className="break-words text-[17px] font-semibold leading-snug tracking-tight text-zinc-900">
            {space.title}
          </h2>
          <p className="mt-1 break-words text-sm text-zinc-500">
            {space.shopping_center_name} · {space.type}
          </p>
          <p className="mt-3 text-lg font-semibold text-zinc-900">
            ${space.monthly_price_usd}
            <span className="text-sm font-normal text-zinc-500"> /mes</span>
          </p>
          <span className="mt-3 inline-block text-sm font-semibold text-zinc-900 underline-offset-4 group-hover:underline">
            Ver detalle
          </span>
        </div>
      </Link>
    </article>
  );
}

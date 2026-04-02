import Link from "next/link";
import { notFound } from "next/navigation";

import { SpaceCard } from "@/components/space/SpaceCard";
import { EmptyState, EmptyStateIconPhoto } from "@/components/ui/EmptyState";
import { getMallMeta } from "@/lib/catalog";
import { getCenterByCode, getSpaces } from "@/services/api";

export default async function MallSpacesView({ centerCode }) {
  const upper = String(centerCode || "").toUpperCase();
  if (!upper) notFound();

  let center;
  try {
    center = await getCenterByCode(upper);
  } catch {
    notFound();
  }

  if (center.is_active === false || !center.marketplace_enabled) {
    notFound();
  }

  let meta = getMallMeta(upper);
  if (center) {
    const name = typeof center.name === "string" ? center.name : "";
    const display =
      typeof center.display_title === "string" ? center.display_title.trim() : "";
    if (display) {
      meta = { title: display, subtitle: name && name !== display ? name : "" };
    } else {
      meta = { title: name || upper, subtitle: "" };
    }
  }
  if (!meta?.title) {
    notFound();
  }

  const spaces = await getSpaces(upper);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-zinc-50/80">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-zinc-500 transition-colors duration-200 ease-out hover:text-zinc-900"
        >
          ← Todos los centros
        </Link>
        <h1 className="mt-6 text-balance break-words text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-2 break-words text-zinc-600">{meta.subtitle}</p>

        {spaces.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<EmptyStateIconPhoto />}
              title="No hay espacios publicados en este centro"
              description="Por ahora no hay tomas disponibles. Puedes cargarlas desde el panel de administración o volver más tarde."
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
            {spaces.map((s) => (
              <SpaceCard key={s.id} space={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { HomeMallCatalogClient } from "@/components/home/HomeMallCatalogClient";

/** Portada del marketplace (listado de centros). */
export default function HomeView() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-zinc-50">
      <div
        className="h-1.5 w-full bg-gradient-to-r from-[#2c2c81] via-[#a0034e] to-[#009ce0]"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        <header className="max-w-2xl">
          <span className="inline-flex rounded-full border border-orange-200/90 bg-gradient-to-r from-orange-50/95 to-amber-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-950 shadow-sm ring-1 ring-orange-100/60">
            Marketplace · Venezuela
          </span>
          <h1 className="mt-5 text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl">
            Elige un centro comercial
          </h1>
        </header>

        <HomeMallCatalogClient />
      </div>
    </div>
  );
}

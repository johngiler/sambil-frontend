import Link from "next/link";

export default function CatalogNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-20">
      <p className="font-mono text-xs font-medium uppercase tracking-wider text-zinc-400">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
        Espacio no encontrado
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        Este espacio no está disponible en el catálogo o ya no existe. Revisa el enlace o vuelve al
        listado.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold text-white mp-admin-primary-btn"
      >
        Volver al catálogo
      </Link>
    </div>
  );
}

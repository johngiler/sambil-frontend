import { HomeSpacesCatalogClient } from "@/components/home/HomeSpacesCatalogClient";

/** Portada del marketplace (tomas con búsqueda y filtro por ciudad). */
export default function HomeView() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-transparent">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        <HomeSpacesCatalogClient />
      </div>
    </div>
  );
}

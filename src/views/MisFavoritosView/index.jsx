"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";

import { MisFavoritosSkeleton } from "@/components/orders/MisFavoritosSkeleton";
import { SpaceCardWithCart } from "@/components/space/SpaceCardWithCart";
import { useAuth } from "@/context/AuthContext";
import { marketplacePrimaryBtn } from "@/lib/marketplaceActionButtons";
import { deleteFavorite, MY_FAVORITES_PATH } from "@/services/clientAccountApi";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { authJsonFetcher } from "@/lib/swr/fetchers";

export default function MisFavoritosView() {
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const { authReady, me, isAdmin, isClient, accessToken } = useAuth();
  const [removingId, setRemovingId] = useState(null);
  const [err, setErr] = useState("");

  const canFetch = authReady && isClient && !!accessToken;
  const { data, error, isLoading, mutate } = useSWR(
    canFetch ? MY_FAVORITES_PATH : null,
    authJsonFetcher,
  );

  useEffect(() => {
    if (!authReady) return;
    if (!me) {
      router.replace("/login?next=/cuenta/favoritos");
      return;
    }
    if (isAdmin) {
      router.replace("/dashboard");
      return;
    }
    if (!isClient) {
      router.replace("/cuenta");
      return;
    }
  }, [authReady, me, isAdmin, isClient, router]);

  useEffect(() => {
    setErr(error instanceof Error ? error.message : error ? String(error) : "");
  }, [error]);

  const remove = useCallback(
    async (adSpaceId) => {
      setErr("");
      setRemovingId(adSpaceId);
      try {
        await deleteFavorite({ adSpaceId, token: accessToken });
        await mutate();
        await globalMutate(
          (key) => typeof key === "string" && key.startsWith(MY_FAVORITES_PATH),
          undefined,
          { revalidate: true },
        );
      } catch (e) {
        setErr(e instanceof Error ? e.message : "No se pudo quitar el favorito.");
      } finally {
        setRemovingId(null);
      }
    },
    [accessToken, mutate, globalMutate],
  );

  if (!authReady || !me || isAdmin || !isClient) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-zinc-500">
        Cargando…
      </div>
    );
  }

  const loading = canFetch && isLoading && !error;
  const results = Array.isArray(data?.results) ? data.results : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        Mis favoritos
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Tomas que marcaste en el catálogo. La disponibilidad muestra meses ocupados o bloqueados (naranja) y
        libres (gris) para este año y el siguiente.
      </p>

      {err ? (
        <p className={`${ROUNDED_CONTROL} mt-6 bg-red-50 px-3 py-2 text-sm text-red-800`} role="alert">
          {err}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8">
          <MisFavoritosSkeleton />
        </div>
      ) : results.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-10 text-center">
          <p className="text-sm text-zinc-600">
            Aún no tienes favoritos. En el detalle de una toma del catálogo pulsa el icono de corazón en la
            imagen (esquina superior derecha).
          </p>
          <Link
            href="/"
            className={`${marketplacePrimaryBtn} mt-6 inline-flex items-center justify-center no-underline`}
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid list-none gap-[10px] p-0 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {results.map((row, index) => {
            const sp = row?.ad_space;
            if (!sp || typeof sp !== "object") return null;
            const id = sp.id;
            const y1 = sp.availability_year_next ?? (Number(sp.availability_year) || new Date().getFullYear()) + 1;
            const nextOcc = sp.months_occupied_next_year;
            const secondary =
              Array.isArray(nextOcc) && nextOcc.length === 12
                ? { year: y1, monthsOccupied: nextOcc }
                : null;
            return (
              <li key={row.id ?? id}>
                <SpaceCardWithCart
                  space={sp}
                  availabilityLabel="occupied"
                  showFooterLink={false}
                  priority={index < 6}
                  secondaryAvailability={secondary}
                  cardFooter={
                    <button
                      type="button"
                      disabled={removingId === id}
                      className={`${ROUNDED_CONTROL} w-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50`}
                      onClick={() => remove(id)}
                    >
                      {removingId === id ? "Quitando…" : "Quitar de favoritos"}
                    </button>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

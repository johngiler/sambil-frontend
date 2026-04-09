"use client";

import Link from "next/link";
import { useMemo } from "react";
import useSWR from "swr";

import { CentrosAdminSection } from "@/components/admin/sections/CentrosAdminSection";
import { ClientesAdminSection } from "@/components/admin/sections/ClientesAdminSection";
import { PedidosAdminSection } from "@/components/admin/sections/PedidosAdminSection";
import { TomasAdminSection } from "@/components/admin/sections/TomasAdminSection";
import { UsuariosAdminSection } from "@/components/admin/sections/UsuariosAdminSection";
import { DashboardChromeSkeleton } from "@/components/admin/skeletons/DashboardChromeSkeleton";
import { ResumenTabSkeleton } from "@/components/admin/skeletons/ResumenTabSkeleton";
import { IconChevronLeft } from "@/components/layout/navIcons";
import { useAuth } from "@/context/AuthContext";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { authJsonFetcher } from "@/lib/swr/fetchers";
import { parsePaginatedResponse } from "@/services/api";

/** Etiqueta de rol como en el panel Usuarios (UserProfile). */
const MARKETPLACE_ROLE_BADGE_LABEL = {
  admin: "Administrador marketplace",
  client: "Cliente marketplace",
};

function marketplaceRoleBadgeLabel(role) {
  if (role == null || role === "") return "";
  return MARKETPLACE_ROLE_BADGE_LABEL[role] ?? role;
}

const DASHBOARD_KPI_KEYS = {
  centers: "/api/admin/centers/",
  spaces: "/api/admin/spaces/",
  clients: "/api/clients/",
  users: "/api/admin/users/",
  orders: "/api/orders/",
};

function ResumenTab() {
  const { authReady, accessToken } = useAuth();
  const fetchKpis = authReady && !!accessToken;

  const { data: dc, isLoading: l0 } = useSWR(fetchKpis ? DASHBOARD_KPI_KEYS.centers : null, authJsonFetcher);
  const { data: ds, isLoading: l1 } = useSWR(fetchKpis ? DASHBOARD_KPI_KEYS.spaces : null, authJsonFetcher);
  const { data: dcl, isLoading: l2 } = useSWR(fetchKpis ? DASHBOARD_KPI_KEYS.clients : null, authJsonFetcher);
  const { data: du, isLoading: l3 } = useSWR(fetchKpis ? DASHBOARD_KPI_KEYS.users : null, authJsonFetcher);
  const { data: do_, isLoading: l4 } = useSWR(fetchKpis ? DASHBOARD_KPI_KEYS.orders : null, authJsonFetcher);

  const { nCenters, nSpaces, nClients, nUsers, nOrders, ready } = useMemo(() => {
    if (!fetchKpis) {
      return {
        nCenters: "—",
        nSpaces: "—",
        nClients: "—",
        nUsers: "—",
        nOrders: "—",
        ready: true,
      };
    }
    const loading = l0 || l1 || l2 || l3 || l4;
    if (loading) {
      return {
        nCenters: "—",
        nSpaces: "—",
        nClients: "—",
        nUsers: "—",
        nOrders: "—",
        ready: false,
      };
    }
    const fmt = (d) => (d != null ? String(parsePaginatedResponse(d).count) : "?");
    return {
      nCenters: fmt(dc),
      nSpaces: fmt(ds),
      nClients: fmt(dcl),
      nUsers: fmt(du),
      nOrders: fmt(do_),
      ready: true,
    };
  }, [fetchKpis, l0, l1, l2, l3, l4, dc, ds, dcl, du, do_]);

  if (!ready) {
    return <ResumenTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className={`${ROUNDED_CONTROL} border border-dashed border-zinc-300 bg-zinc-50/80 p-5 text-sm text-zinc-700`}>
        <p className="font-medium text-zinc-900">KPIs y gráficos</p>
        <p className="mt-1">
          Fase 2: aquí irán métricas operativas (conversión, ocupación, ingresos, etc.). Por ahora solo
          conteos rápidos.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          ["Centros comerciales", nCenters],
          ["Tomas (espacios)", nSpaces],
          ["Clientes", nClients],
          ["Usuarios", nUsers],
          ["Pedidos", nOrders],
        ].map(([label, val]) => (
          <div key={label} className={`${ROUNDED_CONTROL} border border-zinc-200 bg-white p-4 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardView({ section = "resumen" }) {
  const { authReady, role } = useAuth();

  if (!authReady) {
    return (
      <div className="mx-auto max-w-6xl py-16">
        <DashboardChromeSkeleton />
      </div>
    );
  }

  const roleBadge = marketplaceRoleBadgeLabel(role);

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="flex flex-wrap items-center gap-x-3 gap-y-2 text-2xl font-bold text-zinc-900 sm:text-3xl">
          <span>Panel de administración</span>
          {roleBadge ? (
            <span
              className="inline-flex max-w-full items-center rounded-full border border-orange-200/90 bg-gradient-to-r from-orange-50/95 via-amber-50/80 to-white px-4 py-1.5 text-sm font-semibold text-orange-950 shadow-sm ring-1 ring-orange-100/70"
              title="Tu rol en este marketplace"
            >
              {roleBadge}
            </span>
          ) : null}
        </h1>
      </header>

      <div className="mt-8">
        {section === "resumen" ? <ResumenTab /> : null}
        {section === "centros" ? <CentrosAdminSection /> : null}
        {section === "tomas" ? <TomasAdminSection /> : null}
        {section === "usuarios" ? <UsuariosAdminSection /> : null}
        {section === "clientes" ? <ClientesAdminSection /> : null}
        {section === "pedidos" ? <PedidosAdminSection /> : null}
      </div>

      <p className="mt-10 text-sm text-zinc-500 lg:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-medium text-zinc-800 no-underline underline-offset-4 hover:underline"
        >
          <IconChevronLeft className="text-zinc-600" />
          Volver al marketplace
        </Link>
      </p>
    </div>
  );
}

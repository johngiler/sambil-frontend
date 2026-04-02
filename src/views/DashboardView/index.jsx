"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CentrosAdminSection } from "@/components/admin/sections/CentrosAdminSection";
import { ClientesAdminSection } from "@/components/admin/sections/ClientesAdminSection";
import { PedidosAdminSection } from "@/components/admin/sections/PedidosAdminSection";
import { TomasAdminSection } from "@/components/admin/sections/TomasAdminSection";
import { UsuariosAdminSection } from "@/components/admin/sections/UsuariosAdminSection";
import { DashboardChromeSkeleton } from "@/components/admin/skeletons/DashboardChromeSkeleton";
import { ResumenTabSkeleton } from "@/components/admin/skeletons/ResumenTabSkeleton";
import { useAuth } from "@/context/AuthContext";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { parsePaginatedResponse } from "@/services/api";
import { authFetch } from "@/services/authApi";

const SECTION_TITLE = {
  resumen: "Resumen",
  centros: "Centros comerciales",
  tomas: "Tomas (espacios)",
  usuarios: "Usuarios",
  clientes: "Clientes empresa",
  pedidos: "Pedidos",
};

function ResumenTab() {
  const [nCenters, setNCenters] = useState("—");
  const [nSpaces, setNSpaces] = useState("—");
  const [nClients, setNClients] = useState("—");
  const [nUsers, setNUsers] = useState("—");
  const [nOrders, setNOrders] = useState("—");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dc, ds, dcl, du, do_] = await Promise.all([
          authFetch("/api/admin/centers/"),
          authFetch("/api/admin/spaces/"),
          authFetch("/api/clients/"),
          authFetch("/api/admin/users/"),
          authFetch("/api/orders/"),
        ]);
        if (cancelled) return;
        setNCenters(String(parsePaginatedResponse(dc).count));
        setNSpaces(String(parsePaginatedResponse(ds).count));
        setNClients(String(parsePaginatedResponse(dcl).count));
        setNUsers(String(parsePaginatedResponse(du).count));
        setNOrders(String(parsePaginatedResponse(do_).count));
      } catch {
        if (!cancelled) {
          setNCenters("?");
          setNSpaces("?");
          setNClients("?");
          setNUsers("?");
          setNOrders("?");
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
          ["Centros", nCenters],
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
  const { authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="mx-auto max-w-6xl py-16">
        <DashboardChromeSkeleton />
      </div>
    );
  }

  const title = SECTION_TITLE[section] ?? "Panel";

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Panel de administración</h1>
      <p className="mt-3">
        <span
          className="inline-flex max-w-full items-center rounded-full border border-orange-200/90 bg-gradient-to-r from-orange-50/95 via-amber-50/80 to-white px-4 py-1.5 text-sm font-semibold text-orange-950 shadow-sm ring-1 ring-orange-100/70"
          aria-label={`Sección en gestión: ${title}`}
        >
          {title}
        </span>
      </p>

      <div className="mt-8">
        {section === "resumen" ? <ResumenTab /> : null}
        {section === "centros" ? <CentrosAdminSection /> : null}
        {section === "tomas" ? <TomasAdminSection /> : null}
        {section === "usuarios" ? <UsuariosAdminSection /> : null}
        {section === "clientes" ? <ClientesAdminSection /> : null}
        {section === "pedidos" ? <PedidosAdminSection /> : null}
      </div>

      <p className="mt-10 text-sm text-zinc-500 lg:hidden">
        <Link href="/" className="font-medium text-zinc-800 underline-offset-4 hover:underline">
          Volver al marketplace
        </Link>
      </p>
    </div>
  );
}

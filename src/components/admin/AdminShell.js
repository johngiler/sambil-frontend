"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { AdminMobileNavToggle, AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }) {
  const { authReady, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!authReady) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-zinc-500">Cargando…</div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-zinc-700">No tienes permiso para acceder aquí.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-zinc-900 no-underline underline-offset-4 transition-colors hover:underline">
          Inicio
        </Link>
      </div>
    );
  }

  return (
    // Sin overflow-x en este flex: si no, `position:sticky` del sidebar deja de adherirse al viewport (Chrome).
    <div className="flex min-h-[min(100dvh,1200px)] w-full min-w-0 max-w-[100vw]">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div
        className={`min-w-0 w-full flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:py-8${
          mobileOpen ? " max-lg:pointer-events-none" : ""
        }`}
      >
        <AdminMobileNavToggle onClick={() => setMobileOpen(true)} />
        {children}
      </div>
    </div>
  );
}

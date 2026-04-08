"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { ADMIN_NAV } from "@/components/admin/adminNavConfig";
import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconMenu,
} from "@/components/layout/navIcons";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

const ADMIN_SIDEBAR_COLLAPSED_KEY = "sambil-admin-sidebar-collapsed";

function navActive(pathname, href) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname() || "";
  const { displayName } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      setCollapsed(window.localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        window.localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const linkClass = (active) =>
    `flex items-center gap-3 px-3 ${ROUNDED_CONTROL} py-2.5 text-sm font-medium transition-colors ${
      collapsed ? "lg:justify-center lg:gap-0 lg:px-2" : ""
    } ${
      active
        ? "bg-zinc-900 text-white shadow-sm"
        : "text-zinc-700 hover:bg-zinc-200/80 hover:text-zinc-900"
    }`;

  const nav = (
    <nav className="space-y-1 p-3 lg:pt-5" aria-label="Panel administración">
      {ADMIN_NAV.map(({ href, label, Icon, segment }) => {
        const active = navActive(pathname, href);
        return (
          <Link
            key={segment}
            href={href}
            className={linkClass(active)}
            title={label}
            onClick={() => setMobileOpen(false)}
          >
            <Icon className={`shrink-0 ${active ? "text-white" : "text-zinc-500"}`} />
            <span className={collapsed ? "lg:sr-only" : ""}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const workspaceInitial = (displayName || "?").trim().slice(0, 1).toUpperCase() || "?";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-[2px] transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`relative flex h-full w-[min(17rem,88vw)] shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 shadow-xl transition-[width,transform] duration-200 ease-out lg:static lg:z-20 lg:h-auto lg:min-h-[calc(100dvh-4rem)] lg:shrink-0 lg:shadow-none ${
          collapsed ? "lg:w-[4.25rem]" : "lg:w-56"
        } fixed left-0 top-0 z-50 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-3 lg:hidden">
          <p className="text-sm font-semibold text-zinc-900">Menú</p>
          <button
            type="button"
            className={`${ROUNDED_CONTROL} p-2 text-zinc-600 hover:bg-zinc-200`}
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
          >
            <IconClose />
          </button>
        </div>

        <div className="relative hidden border-b border-zinc-200 lg:block">
          {collapsed ? (
            <div className="flex flex-col items-center px-2 py-3 pb-5" title={displayName || undefined}>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-200/90 text-sm font-bold text-zinc-800"
                aria-hidden
              >
                {workspaceInitial}
              </span>
              <span className="sr-only">{displayName}</span>
            </div>
          ) : (
            <div className="px-4 pb-5 pt-4 pr-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Administración</p>
              <p className="mt-1 truncate text-sm font-semibold text-zinc-900" title={displayName || undefined}>
                {displayName}
              </p>
            </div>
          )}
          <button
            type="button"
            className="mp-ring-brand absolute bottom-0 right-0 z-30 flex h-9 w-9 translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md transition hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_40%,transparent)]"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expandir menú del panel" : "Contraer menú del panel"}
            onClick={toggleCollapsed}
          >
            {collapsed ? (
              <IconChevronRight className="h-4 w-4" />
            ) : (
              <IconChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {nav}

        <div className="mt-auto border-t border-zinc-200 p-3 lg:mt-4">
          <Link
            href="/"
            className={`flex items-center justify-center gap-2 px-3 ${ROUNDED_CONTROL} py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200/60 ${
              collapsed ? "lg:justify-center lg:gap-0 lg:px-2" : ""
            }`}
            title="Volver al marketplace"
            aria-label="Volver al marketplace"
            onClick={() => setMobileOpen(false)}
          >
            <IconChevronLeft className="shrink-0 text-zinc-600" />
            <span className={collapsed ? "lg:sr-only" : ""}>Volver al marketplace</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

export function AdminMobileNavToggle({ onClick }) {
  return (
    <button
      type="button"
      className={`mb-4 inline-flex items-center gap-2 ${ROUNDED_CONTROL} border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm lg:hidden`}
      aria-label="Abrir menú del panel"
      onClick={onClick}
    >
      <IconMenu />
      Secciones
    </button>
  );
}

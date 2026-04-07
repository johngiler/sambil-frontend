"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV } from "@/components/admin/adminNavConfig";
import { IconChevronLeft, IconClose, IconMenu } from "@/components/layout/navIcons";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

function navActive(pathname, href) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname() || "";
  const { displayName } = useWorkspace();

  const linkClass = (active) =>
    `flex items-center gap-3 ${ROUNDED_CONTROL} px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? "bg-zinc-900 text-white shadow-sm"
        : "text-zinc-700 hover:bg-zinc-200/80 hover:text-zinc-900"
    }`;

  const nav = (
    <nav className="space-y-1 p-3" aria-label="Panel administración">
      {ADMIN_NAV.map(({ href, label, Icon, segment }) => {
        const active = navActive(pathname, href);
        return (
          <Link
            key={segment}
            href={href}
            className={linkClass(active)}
            onClick={() => setMobileOpen(false)}
          >
            <Icon className={active ? "text-white" : "text-zinc-500"} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

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
        className={`fixed left-0 top-0 z-50 flex h-full w-[min(17rem,88vw)] flex-col border-r border-zinc-200 bg-zinc-50 shadow-xl transition-transform duration-200 ease-out lg:static lg:z-0 lg:h-auto lg:min-h-[calc(100dvh-4rem)] lg:w-56 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
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
        <div className="hidden border-b border-zinc-200 px-4 py-4 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Administración</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">{displayName}</p>
        </div>
        {nav}
        <div className="mt-auto border-t border-zinc-200 p-3 lg:mt-4">
          <Link
            href="/"
            className={`flex items-center justify-center gap-2 ${ROUNDED_CONTROL} px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200/60`}
            onClick={() => setMobileOpen(false)}
          >
            <IconChevronLeft className="text-zinc-600" />
            Volver al marketplace
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

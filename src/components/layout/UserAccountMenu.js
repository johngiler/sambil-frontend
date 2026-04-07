"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  IconBuilding,
  IconChevronDown,
  IconLogout,
  IconUser,
} from "@/components/layout/navIcons";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

const menuItem =
  "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none";

const menuDanger = `${menuItem} text-red-700 hover:bg-red-50 focus:bg-red-50`;

const triggerClass = `mp-ring-brand inline-flex min-h-11 max-w-[14rem] shrink-0 items-center gap-2 ${ROUNDED_CONTROL} border border-transparent px-2.5 text-sm font-medium text-zinc-600 transition-colors duration-200 ease-out hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none sm:min-h-0 sm:py-1`;

export function UserAccountMenu({
  me,
  logout,
  onNavigate,
  showMiEmpresa = false,
  showMiNegocio = false,
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const handleNav = () => {
    close();
    onNavigate?.();
  };

  const perfilHref = "/cuenta/perfil";
  const empresaHref = "/cuenta";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="user-account-menu"
        id="user-account-trigger"
        onClick={() => setOpen((v) => !v)}
        title={me.email || me.username}
      >
        <IconUser className="text-zinc-400" />
        <span className="truncate">{me.username}</span>
        <IconChevronDown
          className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div
          id="user-account-menu"
          role="menu"
          aria-labelledby="user-account-trigger"
          className={`absolute right-0 top-full z-50 mt-1 min-w-[13.5rem] overflow-hidden ${ROUNDED_CONTROL} border border-zinc-200 bg-white py-1 shadow-lg ring-1 ring-zinc-950/5`}
        >
          <Link href={perfilHref} role="menuitem" className={menuItem} onClick={handleNav}>
            <IconUser className="text-zinc-400" />
            Mi perfil
          </Link>
          {showMiNegocio ? (
            <Link href="/cuenta/negocio" role="menuitem" className={menuItem} onClick={handleNav}>
              <IconBuilding className="text-zinc-400" />
              Mi negocio
            </Link>
          ) : null}
          {showMiEmpresa ? (
            <Link href={empresaHref} role="menuitem" className={menuItem} onClick={handleNav}>
              <IconBuilding className="text-zinc-400" />
              Mi empresa
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className={menuDanger}
            onClick={() => {
              logout();
              close();
              onNavigate?.();
            }}
          >
            <IconLogout className="text-red-600/80" />
            Salir
          </button>
        </div>
      ) : null}
    </div>
  );
}

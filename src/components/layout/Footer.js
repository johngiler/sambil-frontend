"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { normalizeMediaUrlForUi } from "@/services/api";

const linkClass =
  "mp-ring-brand-dark text-sm text-zinc-400 transition-colors duration-200 ease-out hover:text-white focus-visible:outline-none";

const sectionTitle =
  "text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500";

export function Footer() {
  const { me, isClient, isAdmin } = useAuth();
  const { workspace, displayName } = useWorkspace();
  const showMarketplaceCart = !me || isClient;
  const footerLogo = workspace?.logo_mark_url || workspace?.logo_url;

  return (
    <footer className="relative mt-auto bg-zinc-950 text-zinc-400">
      <div
        className="mp-brand-gradient-h h-1 w-full"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-10 sm:gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="flex max-w-lg flex-col items-start gap-4 min-[480px]:flex-row min-[480px]:items-center sm:gap-6">
            <div className="flex shrink-0 items-center justify-center">
              <img
                src={footerLogo ? normalizeMediaUrlForUi(footerLogo) : "/icon.svg"}
                alt={displayName}
                width={100}
                height={100}
                className="h-[4.5rem] w-auto max-w-[5.5rem] object-contain sm:h-[5rem] sm:max-w-[6rem]"
                decoding="async"
              />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold tracking-tight text-white">
                {displayName}{" "}
                <span className="font-normal text-zinc-400">Marketplace</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Reserva y gestiona espacios publicitarios en nuestros centros
                comerciales. Inventario, disponibilidad y flujo de pedidos en
                una sola plataforma.
              </p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-8 min-[380px]:grid-cols-2 sm:gap-10 lg:max-w-md lg:gap-12">
            <div>
              <h3 className={sectionTitle}>Explorar</h3>
              <ul className="mt-4 flex flex-col gap-3">
                <li>
                  <Link href="/" className={linkClass}>
                    Catálogo
                  </Link>
                </li>
                {showMarketplaceCart ? (
                  <>
                    <li>
                      <Link href="/cart" className={linkClass}>
                        Carrito
                      </Link>
                    </li>
                    <li>
                      <Link href="/checkout" className={linkClass}>
                        Checkout
                      </Link>
                    </li>
                  </>
                ) : null}
              </ul>
            </div>
            {me && isAdmin ? (
              <div>
                <h3 className={sectionTitle}>Operación</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  <li>
                    <Link href="/dashboard" className={linkClass}>
                      Panel
                    </Link>
                  </li>
                  <li>
                    <span className="text-sm text-zinc-600">Inventario</span>
                  </li>
                  <li>
                    <span className="text-sm text-zinc-600">Pedidos</span>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12 border-t border-white/[0.08] pt-8">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} {displayName} · Marketplace de publicidad en
            centros comerciales.
          </p>
        </div>
      </div>
    </footer>
  );
}

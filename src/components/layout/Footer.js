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
  /** Solo isotipo del API (`logo_mark_url`); si no viene, no se muestra imagen. */
  const footerIsotypeUrl =
    typeof workspace?.logo_mark_url === "string" &&
    workspace.logo_mark_url.trim() !== ""
      ? workspace.logo_mark_url.trim()
      : null;
  const supportEmail =
    typeof workspace?.support_email === "string" &&
    workspace.support_email.trim() !== ""
      ? workspace.support_email.trim()
      : null;
  const phone =
    typeof workspace?.phone === "string" && workspace.phone.trim() !== ""
      ? workspace.phone.trim()
      : null;
  const country =
    typeof workspace?.country === "string" && workspace.country.trim() !== ""
      ? workspace.country.trim()
      : null;
  const showLegalColumn = Boolean(supportEmail || phone || country);
  const showOperacionColumn = Boolean(me && isAdmin);
  const navColCount =
    1 + (showOperacionColumn ? 1 : 0) + (showLegalColumn ? 1 : 0);
  const navGridClass =
    navColCount <= 1
      ? "grid flex-1 grid-cols-1 gap-8 sm:gap-10"
      : navColCount === 2
        ? "grid flex-1 grid-cols-1 gap-8 min-[380px]:grid-cols-2 sm:gap-10 lg:gap-12"
        : "grid flex-1 grid-cols-1 gap-8 min-[380px]:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-10 xl:gap-12";

  return (
    <footer className="relative mt-auto bg-zinc-950 text-zinc-400">
      <div
        className="mp-isotype-gradient-line h-1 w-full shrink-0"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-10 sm:gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="flex max-w-lg flex-col items-start gap-4 min-[480px]:flex-row min-[480px]:items-center sm:gap-6">
            {footerIsotypeUrl ? (
              <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center">
                <img
                  src={normalizeMediaUrlForUi(footerIsotypeUrl)}
                  alt=""
                  width={100}
                  height={100}
                  className="h-[100px] w-[100px] object-contain"
                  decoding="async"
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="text-lg font-semibold tracking-tight text-white">
                {displayName}{" "}
                <span className="font-normal text-zinc-400">Marketplace</span>
              </p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                Reserva y gestiona espacios publicitarios en centros comerciales. Inventario, disponibilidad y pedidos en
                una sola plataforma.
              </p>
            </div>
          </div>

          <div className={navGridClass}>
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
            {showOperacionColumn ? (
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
            {showLegalColumn ? (
              <div>
                <h3 className={sectionTitle}>Datos de contacto</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {supportEmail ? (
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Correo
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={`mailto:${supportEmail}`}
                          className={linkClass}
                        >
                          {supportEmail}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {phone ? (
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Teléfono
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={`tel:${phone.replace(/\s/g, "")}`}
                          className={linkClass}
                        >
                          {phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {country ? (
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        País
                      </dt>
                      <dd className="mt-1 leading-relaxed text-zinc-300">{country}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12 border-t border-white/[0.08] pt-8">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} {displayName} · Marketplace de
            publicidad en centros comerciales.
          </p>
        </div>
      </div>
    </footer>
  );
}

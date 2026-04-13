"use client";

import Link from "next/link";

import { ADMIN_NAV } from "@/components/admin/adminNavConfig";
import {
  IconBuilding,
  IconCart,
  IconCentros,
  IconHeart,
  IconLock,
  IconPay,
  IconUser,
} from "@/components/layout/navIcons";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { normalizeMediaUrlForUi } from "@/services/api";

const linkClass =
  "mp-ring-brand-dark text-sm text-zinc-400 transition-colors duration-200 ease-out hover:text-white focus-visible:outline-none";

const exploreIconClass = "shrink-0 text-zinc-500 transition-colors group-hover:text-white";

const exploreLinkRowClass =
  "group mp-ring-brand-dark inline-flex items-center gap-2.5 rounded-sm text-sm text-zinc-400 transition-colors duration-200 ease-out hover:text-white focus-visible:outline-none";

const sectionTitle =
  "text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500";

const exploreTwoColGrid =
  "mt-4 grid grid-cols-1 gap-8 min-[420px]:grid-cols-2 min-[420px]:gap-x-10 sm:gap-x-12";

const exploreListClass = "flex flex-col gap-3";

function FooterExploreLink({ href, icon: Icon, children }) {
  return (
    <li>
      <Link href={href} className={exploreLinkRowClass}>
        {Icon ? <Icon className={exploreIconClass} /> : null}
        <span className="leading-snug">{children}</span>
      </Link>
    </li>
  );
}

function ExploreTwoColumns({ left, right }) {
  return (
    <div className={exploreTwoColGrid}>
      <ul className={exploreListClass}>{left}</ul>
      <ul className={exploreListClass}>{right}</ul>
    </div>
  );
}

function GuestMarketplaceExploreLinks() {
  return (
    <ExploreTwoColumns
      left={
        <>
          <FooterExploreLink href="/" icon={IconCentros}>
            Catálogo
          </FooterExploreLink>
          <FooterExploreLink href="/cart" icon={IconCart}>
            Carrito
          </FooterExploreLink>
        </>
      }
      right={
        <FooterExploreLink href="/checkout" icon={IconPay}>
          Checkout
        </FooterExploreLink>
      }
    />
  );
}

function FooterExploreList({ me, authReady, isClient, isAdmin }) {
  if (!authReady || !me) {
    return <GuestMarketplaceExploreLinks />;
  }
  if (isAdmin) {
    const dash = ADMIN_NAV;
    const leftNav = dash.slice(0, 4);
    const rightNav = dash.slice(4);
    return (
      <ExploreTwoColumns
        left={
          <>
            {leftNav.map((item) => (
              <FooterExploreLink key={item.segment} href={item.href} icon={item.Icon}>
                {item.label}
              </FooterExploreLink>
            ))}
          </>
        }
        right={
          <>
            {rightNav.map((item) => (
              <FooterExploreLink key={item.segment} href={item.href} icon={item.Icon}>
                {item.label}
              </FooterExploreLink>
            ))}
            <FooterExploreLink href="/cuenta/negocio" icon={IconBuilding}>
              Mi negocio
            </FooterExploreLink>
            <FooterExploreLink href="/cuenta/perfil" icon={IconUser}>
              Mi perfil
            </FooterExploreLink>
          </>
        }
      />
    );
  }
  if (isClient) {
    return (
      <ExploreTwoColumns
        left={
          <>
            <FooterExploreLink href="/" icon={IconCentros}>
              Catálogo
            </FooterExploreLink>
            <FooterExploreLink href="/cart" icon={IconCart}>
              Carrito
            </FooterExploreLink>
            <FooterExploreLink href="/checkout" icon={IconPay}>
              Checkout
            </FooterExploreLink>
            <FooterExploreLink href="/cuenta/pedidos" icon={IconPay}>
              Mis pedidos
            </FooterExploreLink>
          </>
        }
        right={
          <>
            <FooterExploreLink href="/cuenta/contratos" icon={IconLock}>
              Mis contratos
            </FooterExploreLink>
            <FooterExploreLink href="/cuenta/favoritos" icon={IconHeart}>
              Mis favoritos
            </FooterExploreLink>
            <FooterExploreLink href="/cuenta" icon={IconBuilding}>
              Mi empresa
            </FooterExploreLink>
            <FooterExploreLink href="/cuenta/perfil" icon={IconUser}>
              Mi perfil
            </FooterExploreLink>
          </>
        }
      />
    );
  }
  return <GuestMarketplaceExploreLinks />;
}

export function Footer() {
  const { me, authReady, isClient, isAdmin } = useAuth();
  const { workspace, displayName } = useWorkspace();
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
  const navColCount = 1 + (showLegalColumn ? 1 : 0);
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
            <div className="min-w-0">
              <h3 className={sectionTitle}>Explorar</h3>
              <FooterExploreList
                me={me}
                authReady={authReady}
                isClient={isClient}
                isAdmin={isAdmin}
              />
            </div>
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

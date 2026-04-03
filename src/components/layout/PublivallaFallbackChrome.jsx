"use client";

const DEFAULT_PLATFORM = "https://publivalla.com";

export function publivallaSiteUrl() {
  const u = (process.env.NEXT_PUBLIC_PUBLIVALLA_SITE_URL || "").trim();
  return u || DEFAULT_PLATFORM;
}

/**
 * Marco visual común para estados “sin tenant” o error de carga: marca plataforma Publivalla.
 * Un solo CTA sin degradado: volver a publivalla.com.
 */
export function PublivallaFallbackChrome({ badge, title, description, meta }) {
  const platformUrl = publivallaSiteUrl();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#09090b] text-zinc-200 antialiased">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-[20%] -top-[10%] h-[min(70vh,560px)] w-[min(85vw,560px)] rounded-full bg-[#2f246b]/40 blur-[120px]" />
        <div className="absolute -right-[15%] top-1/3 h-[min(50vh,420px)] w-[min(70vw,420px)] rounded-full bg-[color-mix(in_srgb,var(--mp-primary)_22%,transparent)] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[min(45vh,380px)] w-[min(80vw,480px)] -translate-x-1/2 translate-y-1/4 rounded-full bg-[#ea4822]/12 blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(9,9,11,0.15)_0%,#09090b_42%,#09090b_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='72' height='72' viewBox='0 0 72 72' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23fff' d='M36 0 72 36 36 72 0 36Z'/%3E%3C/svg%3E")`,
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <header className="relative z-10 flex shrink-0 items-center justify-between gap-4 px-5 py-5 sm:px-10 sm:py-6">
        <a
          href={platformUrl}
          className="group flex items-baseline gap-0.5 rounded-xl px-1 py-0.5 outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_50%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="bg-gradient-to-r from-[#e9d5ff] via-[#7dd3fc] to-[#fdba74] bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl">
            Publivalla
          </span>
          <span className="text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-400">
            .com
          </span>
        </a>
        <span className="hidden text-right text-[10px] font-semibold uppercase leading-snug tracking-[0.2em] text-zinc-600 sm:block">
          Plataforma
          <br />
          marketplace B2B
        </span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-2 sm:px-6">
        <div className="w-full max-w-[460px]">
          <div className="rounded-[1.65rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-[1px] shadow-[0_32px_100px_-24px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
            <div className="rounded-[calc(1.65rem-1px)] bg-[#0c0c0f]/75 px-7 py-10 text-center sm:px-10 sm:py-12">
              {badge}
              <h1 className="mt-5 text-balance text-[1.625rem] font-semibold leading-[1.2] tracking-tight text-white sm:text-[1.875rem]">
                {title}
              </h1>
              <p className="mx-auto mt-4 max-w-[34ch] text-pretty text-sm leading-relaxed text-zinc-400 sm:text-[0.9375rem]">
                {description}
              </p>
              {meta}
              <div className="mt-9 flex justify-center">
                <a
                  href={platformUrl}
                  className="mp-publivalla-fallback-cta focus-visible:outline-none"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Volver a Publivalla.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-auto shrink-0 border-t border-white/[0.06] px-5 py-4 sm:px-10">
        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="text-[11px] leading-relaxed text-zinc-600">
            Los marketplaces de cada operador viven en su propio espacio. Publivalla es el nivel superior de la
            plataforma.
          </p>
          <a
            href={platformUrl}
            className="shrink-0 text-xs font-semibold text-zinc-300 underline-offset-4 transition hover:text-white hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            publivalla.com
          </a>
        </div>
      </footer>
    </div>
  );
}

export function PublivallaFallbackBadge({ children }) {
  return (
    <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 shadow-inner shadow-black/20">
      <span className="h-2 w-2 shrink-0 rounded-full bg-zinc-400" aria-hidden />
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">{children}</span>
    </div>
  );
}

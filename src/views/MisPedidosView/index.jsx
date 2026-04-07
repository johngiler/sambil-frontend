"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { marketplacePrimaryBtn } from "@/lib/marketplaceActionButtons";
import { formatUsdInteger, totalWithIva } from "@/lib/marketplacePricing";
import { orderListReference } from "@/lib/orderDisplay";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { authFetchAllPages } from "@/services/authApi";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-VE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(iso);
  }
}

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("es-VE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatDateTimeFull(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-VE", {
      dateStyle: "short",
      timeStyle: "medium",
    });
  } catch {
    return String(iso);
  }
}

/** Acento visual según el estado destino del evento */
function timelineTone(toStatus) {
  const s = String(toStatus || "");
  if (s === "draft")
    return {
      dot: "bg-zinc-400",
      ring: "ring-zinc-100",
      bar: "from-zinc-200 to-zinc-300",
      card: "border-zinc-100 bg-zinc-50/90",
    };
  if (s === "submitted")
    return {
      dot: "bg-sky-500",
      ring: "ring-sky-100",
      bar: "from-sky-200 to-sky-300",
      card: "border-sky-100 bg-sky-50/60",
    };
  if (s === "cancelled" || s === "rejected" || s === "expired")
    return {
      dot: "bg-rose-500",
      ring: "ring-rose-100",
      bar: "from-rose-200 to-rose-300",
      card: "border-rose-100 bg-rose-50/50",
    };
  if (s === "installation" || s === "active")
    return {
      dot: "bg-emerald-500",
      ring: "ring-emerald-100",
      bar: "from-emerald-200 to-emerald-300",
      card: "border-emerald-100 bg-emerald-50/50",
    };
  return {
    dot: "bg-[color:var(--mp-primary)]",
    ring: "ring-[color-mix(in_srgb,var(--mp-primary)_22%,transparent)]",
    bar: "from-[color-mix(in_srgb,var(--mp-primary)_28%,#e5e7eb)] to-[color-mix(in_srgb,var(--mp-secondary)_35%,var(--mp-primary))]",
    card: "border-[color-mix(in_srgb,var(--mp-primary)_22%,#e5e7eb)] bg-gradient-to-br from-white to-[color-mix(in_srgb,var(--mp-primary)_8%,#fff)]",
  };
}

function StatusBadge({ label, status }) {
  const paid = status === "paid";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
        paid
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-zinc-200/90 bg-white text-zinc-800"
      }`}
    >
      {label}
    </span>
  );
}

function SectionTitle({ children, id }) {
  return (
    <h2
      id={id}
      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500"
    >
      <span
        className="h-px w-6 bg-gradient-to-r from-[color-mix(in_srgb,var(--mp-primary)_60%,transparent)] to-transparent"
        aria-hidden
      />
      {children}
    </h2>
  );
}

function OrderTimeline({ events }) {
  if (!events || !events.length) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-500">
        Aún no hay movimientos registrados para este pedido.
      </p>
    );
  }
  return (
    <ol className="relative space-y-0 ps-1">
      {events.map((ev, idx) => {
        const tone = timelineTone(ev.to_status);
        const isLast = idx === events.length - 1;
        return (
          <li key={ev.id} className="relative flex gap-0 pb-8 last:pb-0">
            {!isLast ? (
              <div
                className={`absolute start-[11px] top-6 bottom-0 w-px bg-gradient-to-b ${tone.bar} opacity-80`}
                aria-hidden
              />
            ) : null}
            <div className="relative z-[1] flex shrink-0 flex-col items-center pt-0.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${tone.dot} shadow-sm ring-2 ${tone.ring}`}
              >
                <span className="h-2 w-2 rounded-full bg-white/90" />
              </span>
            </div>
            <div
              className={`ms-4 min-w-0 flex-1 rounded-xl border ${tone.card} px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]`}
            >
              <p className="text-[15px] font-semibold leading-snug text-zinc-900">
                {ev.to_label || ev.to_status}
              </p>
              {ev.from_status ? (
                <p className="mt-0.5 text-xs text-zinc-500">
                  <span className="text-zinc-400">Desde</span>{" "}
                  <span className="font-medium text-zinc-600">{ev.from_label || ev.from_status}</span>
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-zinc-200/60 pt-2">
                <time
                  dateTime={ev.created_at}
                  className="text-xs font-medium tabular-nums text-zinc-700"
                >
                  {formatDate(ev.created_at)}
                </time>
                <span className="text-xs tabular-nums text-zinc-500">{formatTime(ev.created_at)}</span>
              </div>
              {ev.actor_username ? (
                <p className="mt-1.5 text-xs text-zinc-500">
                  <span className="text-zinc-400">Usuario</span>{" "}
                  <span className="font-medium text-zinc-700">{ev.actor_username}</span>
                </p>
              ) : null}
              {ev.note ? (
                <p className="mt-2 rounded-md bg-white/60 px-2.5 py-1.5 text-xs leading-relaxed text-zinc-600 ring-1 ring-zinc-100/80">
                  {ev.note}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Chevron({ expanded }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-zinc-50 text-zinc-500 shadow-sm transition-all duration-200 ease-out group-hover:border-[color-mix(in_srgb,var(--mp-primary)_35%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--mp-primary)_8%,#fafafa)] group-hover:text-[color:var(--mp-primary)] ${
        expanded ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="translate-y-px">
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function MisPedidosView() {
  const router = useRouter();
  const { authReady, me, isAdmin, isClient, accessToken } = useAuth();
  const [rows, setRows] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    if (!accessToken) return;
    setErr("");
    const all = await authFetchAllPages("/api/orders/?page_size=100", { token: accessToken });
    setRows(all);
  }, [accessToken]);

  useEffect(() => {
    if (!authReady) return;
    if (!me) {
      router.replace("/login?next=/cuenta/pedidos");
      return;
    }
    if (isAdmin) {
      router.replace("/dashboard");
      return;
    }
    if (!isClient) {
      router.replace("/cuenta");
      return;
    }
  }, [authReady, me, isAdmin, isClient, router]);

  useEffect(() => {
    if (!authReady || !me || isAdmin || !isClient || !accessToken) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await load();
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Error al cargar pedidos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, me, isAdmin, isClient, accessToken, load]);

  if (!authReady || !me || isAdmin || !isClient) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-zinc-500">
        Cargando…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Mis pedidos</h1>
      <p className="mt-2 max-w-xl text-sm text-zinc-600">
        Consulta el estado y abre un pedido para ver el historial detallado.
      </p>

      {err ? (
        <p className={`mt-6 ${ROUNDED_CONTROL} bg-red-50 px-3 py-2 text-sm text-red-800`}>{err}</p>
      ) : null}

      {loading ? (
        <div className="mt-10 space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100/90" />
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100/90" />
        </div>
      ) : rows.length === 0 ? (
        <div
          className={`mt-8 ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50/80 px-5 py-8 text-center shadow-sm`}
        >
          <p className="text-sm text-zinc-600">No tienes pedidos todavía.</p>
          <Link href="/" className={`${marketplacePrimaryBtn} mt-4 px-5 py-2.5 text-sm font-semibold`}>
            Ver centros y catálogo
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {rows.map((o) => {
            const expanded = openId === o.id;
            const timeline = Array.isArray(o.status_timeline) ? o.status_timeline : [];
            const panelId = `pedido-panel-${o.id}`;
            const items = Array.isArray(o.items) ? o.items : [];
            const first = items[0];
            const firstTitle =
              first && typeof first.ad_space_title === "string"
                ? first.ad_space_title
                : first?.ad_space_code || "Línea";
            const firstCenter =
              first && typeof first.shopping_center_name === "string"
                ? first.shopping_center_name
                : "";
            const lineDesc = firstCenter ? `${firstTitle} · ${firstCenter}` : firstTitle;
            const lineSub = first != null ? Number(first.subtotal) : NaN;
            const lineDisplay = Number.isFinite(lineSub) ? lineSub : Number(o.total_amount);
            const totalIva = totalWithIva(Number(o.total_amount));
            return (
              <li
                key={o.id}
                className={`${ROUNDED_CONTROL} overflow-hidden border border-zinc-200/90 bg-white shadow-sm transition hover:shadow-md`}
              >
                <button
                  type="button"
                  className="group flex w-full items-start justify-between gap-4 px-4 py-5 text-left sm:px-6"
                  onClick={() => setOpenId(expanded ? null : o.id)}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                >
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold text-zinc-900">
                        {orderListReference(o.id)}
                      </span>
                      <StatusBadge status={o.status} label={o.status_label || o.status} />
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-3 border-t border-zinc-100 pt-3">
                      <div className="min-w-0">
                        <p className="text-sm text-zinc-600">{lineDesc}</p>
                        {items.length > 1 ? (
                          <p className="mt-1 text-xs text-zinc-400">+{items.length - 1} línea(s) más</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-lg font-bold tabular-nums text-[#d98e32]">
                        {formatUsdInteger(lineDisplay)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                      <time
                        dateTime={o.submitted_at || o.created_at}
                        className="text-sm font-semibold tabular-nums text-zinc-900"
                      >
                        {o.submitted_at || o.created_at
                          ? formatDateTimeFull(o.submitted_at || o.created_at)
                          : "—"}
                      </time>
                      <span className="text-lg font-bold tabular-nums text-[#d98e32]">
                        {formatUsdInteger(totalIva)}
                      </span>
                    </div>
                  </div>
                  <Chevron expanded={expanded} />
                </button>
                {expanded ? (
                  <div
                    id={panelId}
                    className="border-t border-zinc-100 bg-zinc-50/80 px-4 pb-5 pt-4 sm:px-5 sm:pb-6"
                  >
                    <div className="grid gap-6 sm:grid-cols-1">
                      <div className="rounded-xl border border-zinc-100 bg-white/90 p-4 shadow-sm">
                        <SectionTitle id={`${panelId}-lineas`}>Reserva — líneas</SectionTitle>
                        <ul
                          className="mt-3 space-y-3 text-sm"
                          aria-labelledby={`${panelId}-lineas`}
                        >
                          {(o.items || []).map((it) => (
                            <li
                              key={it.id}
                              className="flex flex-col gap-1 border-b border-zinc-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <span className="font-mono font-medium text-zinc-900">
                                  {it.ad_space_code || `#${it.ad_space}`}
                                </span>
                                <p className="mt-0.5 text-xs text-zinc-500">
                                  Contrato {it.start_date} → {it.end_date}
                                </p>
                              </div>
                              <span className="tabular-nums text-sm font-semibold text-zinc-800">
                                ${it.subtotal} USD
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-zinc-100 bg-white/90 p-4 shadow-sm">
                        <SectionTitle id={`${panelId}-hist`}>Historial de estados</SectionTitle>
                        <div className="mt-4" aria-labelledby={`${panelId}-hist`}>
                          <OrderTimeline events={timeline} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

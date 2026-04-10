"use client";

import Link from "next/link";
import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ORDER_STATUS, SPACE_STATUS } from "@/components/admin/adminConstants";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

/** Pares [intenso, suave] para rellenos en degradé de donuts y leyendas. */
const SLICE_GRADIENT_STOPS = [
  ["#7c3aed", "#ddd6fe"],
  ["#ea580c", "#fed7aa"],
  ["#0891b2", "#a5f3fc"],
  ["#059669", "#a7f3d0"],
  ["#db2777", "#fbcfe8"],
  ["#ca8a04", "#fef08a"],
  ["#4f46e5", "#c7d2fe"],
  ["#e11d48", "#fecdd3"],
  ["#0d9488", "#99f6e4"],
  ["#9333ea", "#e9d5ff"],
];

const CARD_SPACES = `${ROUNDED_CONTROL} relative overflow-hidden border border-cyan-200/50 bg-gradient-to-br from-cyan-50/70 via-white to-teal-50/40 p-4 shadow-[0_2px_20px_rgba(6,182,212,0.07)] sm:p-5`;
const CARD_ORDERS = `${ROUNDED_CONTROL} relative overflow-hidden border border-violet-200/50 bg-gradient-to-br from-violet-50/65 via-white to-fuchsia-50/35 p-4 shadow-[0_2px_20px_rgba(124,58,237,0.07)] sm:p-5`;
const CARD_CENTERS = `${ROUNDED_CONTROL} relative overflow-hidden border border-sky-200/50 bg-gradient-to-br from-sky-50/55 via-white to-indigo-50/40 p-4 shadow-[0_2px_18px_rgba(14,165,233,0.07)] sm:p-5`;
const TITLE = "text-sm font-semibold text-zinc-900";
const SUB = "mt-0.5 text-xs text-zinc-500";

function statusLabel(map, code) {
  const o = map.find((x) => String(x.v) === String(code ?? ""));
  return o ? o.l : code ? String(code) : "—";
}

function formatDayTick(iso) {
  if (!iso) return "";
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("es-VE", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function OrdersAreaChart({ data, gradId }) {
  const hasData = data.some((d) => d.count > 0);
  if (!hasData) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-zinc-500 sm:h-[260px]">
        Sin pedidos nuevos en los últimos 30 días.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.95} />
            <stop offset="35%" stopColor="#a78bfa" stopOpacity={0.55} />
            <stop offset="65%" stopColor="#f0abfc" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#fdba74" stopOpacity={0.06} />
          </linearGradient>
          <linearGradient id={`${gradId}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6d28d9" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="#e4e4e7" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDayTick}
          tick={{ fill: "#71717a", fontSize: 10 }}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#71717a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const v = payload[0]?.value;
            return (
              <div
                className={`${ROUNDED_CONTROL} border border-zinc-200/90 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm`}
              >
                <p className="font-medium text-zinc-800">{formatDayTick(label)}</p>
                <p className="mt-0.5 tabular-nums text-zinc-600">
                  Pedidos: <span className="font-semibold text-zinc-900">{v}</span>
                </p>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Pedidos"
          stroke={`url(#${gradId}-stroke)`}
          strokeWidth={2.5}
          fill={`url(#${gradId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatusDonut({ title, subtitle, rows, mapChoices, cardClass, gradientPrefix, afterChart = null }) {
  const data = useMemo(() => {
    return rows.map((r) => ({
      name: statusLabel(mapChoices, r.status),
      value: r.count,
      key: r.status,
    }));
  }, [rows, mapChoices]);

  const hasData = data.some((d) => d.value > 0);
  if (!hasData) {
    return (
      <div className={cardClass}>
        <p className={TITLE}>{title}</p>
        <p className={SUB}>{subtitle}</p>
        <div className="flex h-[200px] items-center justify-center text-sm text-zinc-500">Sin datos</div>
        {afterChart ? <div className="relative mt-3 px-1">{afterChart}</div> : null}
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div
        className="pointer-events-none absolute -right-16 -top-12 size-40 rounded-full bg-gradient-to-br from-white/80 to-transparent opacity-60 blur-2xl"
        aria-hidden
      />
      <div className="relative">
        <p className={TITLE}>{title}</p>
        <p className={SUB}>{subtitle}</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <defs>
            {data.map((_, i) => {
              const [c0, c1] = SLICE_GRADIENT_STOPS[i % SLICE_GRADIENT_STOPS.length];
              return (
                <linearGradient key={i} id={`${gradientPrefix}-slice-${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={c0} stopOpacity={1} />
                  <stop offset="55%" stopColor={c1} stopOpacity={0.92} />
                  <stop offset="100%" stopColor={c1} stopOpacity={0.75} />
                </linearGradient>
              );
            })}
          </defs>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={2}
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry, i) => (
              <Cell key={entry.key || i} fill={`url(#${gradientPrefix}-slice-${i})`} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [v, "Cantidad"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e4e4e7",
              fontSize: 12,
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-zinc-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      {afterChart ? <div className="relative mt-3 px-1 text-center sm:text-left">{afterChart}</div> : null}
    </div>
  );
}

function CentersBarChart({ data, gradId }) {
  if (!data.length) {
    return (
      <div className="flex h-[160px] items-center justify-center text-sm text-zinc-500">
        Añade tomas en los centros para ver esta comparación.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={Math.min(48 + data.length * 36, 280)}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="38%" stopColor="#38bdf8" />
            <stop offset="78%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="#f4f4f5" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: "#3f3f46", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(v) => [v, "Tomas"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 12 }}
        />
        <Bar dataKey="count" fill={`url(#${gradId})`} radius={[0, 8, 8, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * @param {object} props
 * @param {object} props.stats
 */
export function AdminDashboardCharts({ stats }) {
  const uid = useId().replace(/:/g, "");
  const gArea = `dash-area-${uid}`;
  const gCenters = `dash-cc-${uid}`;
  const gDonutSpaces = `dash-donut-sp-${uid}`;
  const gDonutOrders = `dash-donut-ord-${uid}`;

  const centersBarData = useMemo(() => {
    const rows = Array.isArray(stats?.top_centers_by_spaces) ? stats.top_centers_by_spaces : [];
    return rows.map((r) => ({
      name:
        typeof r.name === "string" && r.name.length > 22
          ? `${r.name.slice(0, 20)}…`
          : String(r.name ?? "—"),
      count: Number(r.count) || 0,
    }));
  }, [stats]);

  const ordersDay = Array.isArray(stats?.orders_by_day) ? stats.orders_by_day : [];

  return (
    <div className="space-y-5">
      <div
        className={`relative overflow-hidden ${ROUNDED_CONTROL} border border-zinc-200/90 bg-gradient-to-br from-violet-50/40 via-white to-amber-50/30 p-4 shadow-[0_2px_20px_rgba(124,58,237,0.08)] sm:p-6`}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-violet-400/15 to-orange-400/10 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <p className={TITLE}>Pedidos creados (últimos 30 días)</p>
          <p className={SUB}>
            Volumen diario según la <strong>fecha de creación</strong> del pedido (todos los estados). Complementa
            el comparativo mensual de métricas operativas, que mezcla ingreso contratado y pedidos enviados por mes.
          </p>
          <div className="mt-4">
            <OrdersAreaChart data={ordersDay} gradId={gArea} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <StatusDonut
          title="Tomas por estado"
          subtitle="Disponible, reservado, ocupado, bloqueado"
          rows={Array.isArray(stats?.spaces_by_status) ? stats.spaces_by_status : []}
          mapChoices={SPACE_STATUS}
          cardClass={CARD_SPACES}
          gradientPrefix={gDonutSpaces}
        />
        <StatusDonut
          title="Pedidos por estado"
          subtitle="Cada pedido cuenta una vez según su estado actual (incluye borrador, activo, vencido y cancelado). Para el detalle y las líneas, abre Pedidos."
          rows={Array.isArray(stats?.orders_by_status) ? stats.orders_by_status : []}
          mapChoices={ORDER_STATUS}
          cardClass={CARD_ORDERS}
          gradientPrefix={gDonutOrders}
          afterChart={
            <Link
              href="/dashboard/pedidos"
              className="inline-flex text-sm font-semibold text-violet-900 underline-offset-4 hover:text-violet-950 hover:underline"
            >
              Ir al listado de pedidos →
            </Link>
          }
        />
      </div>

      <div className={CARD_CENTERS}>
        <div
          className="pointer-events-none absolute -right-8 -top-10 size-44 rounded-full bg-gradient-to-bl from-sky-400/15 to-indigo-500/10 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <p className={TITLE}>Centros con más tomas</p>
          <p className={SUB}>Hasta 8 centros ordenados por cantidad de espacios</p>
          <div className="mt-2">
            <CentersBarChart data={centersBarData} gradId={gCenters} />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ROUNDED_CONTROL } from "@/lib/uiRounding";

const TITLE = "text-sm font-semibold text-zinc-900";
const SUB = "mt-0.5 text-xs text-zinc-500";

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

/**
 * Volumen de pedidos creados por día (últimos 30). Va debajo de «Precio medio por toma» en el resumen admin.
 * @param {{ ordersByDay?: Array<{ date: string; count: number }>; gradId: string }} props
 */
export function AdminDashboardOrdersCreatedCard({ ordersByDay = [], gradId }) {
  const data = Array.isArray(ordersByDay) ? ordersByDay : [];

  return (
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
          <OrdersAreaChart data={data} gradId={gradId} />
        </div>
      </div>
    </div>
  );
}

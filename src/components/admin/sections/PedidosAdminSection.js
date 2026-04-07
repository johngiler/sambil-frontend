"use client";

import { Fragment, useCallback, useEffect, useState } from "react";

import {
  AdminAccordionDetailHeader,
  AdminAccordionRowPanel,
  AdminDetailField,
  AdminDetailInset,
  AdminDetailSection,
  adminDetailEmpty,
} from "@/components/admin/AdminAccordionDetail";
import { AdminAccordionToggle } from "@/components/admin/AdminAccordionToggle";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import {
  adminPanelCard,
  adminPrimaryBtn,
  adminSectionHeaderIconWrap,
} from "@/components/admin/adminFormStyles";
import {
  AdminFilterClearButton,
  AdminFiltersRow,
  AdminFilterSearchInput,
  AdminFilterSelect,
  FilterClearAction,
} from "@/components/admin/AdminListFilters";
import { AdminListPagination } from "@/components/admin/AdminListPagination";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { clientStatusLabel, clientStatusPillClassName } from "@/components/admin/adminConstants";
import { IconAdminClipboard, IconAdminRefresh } from "@/components/admin/adminIcons";
import { PedidosSectionSkeleton } from "@/components/admin/skeletons/PedidosSectionSkeleton";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, EmptyStateIconClipboard } from "@/components/ui/EmptyState";
import { ordersListPath } from "@/lib/adminListQuery";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { parsePaginatedResponse } from "@/services/api";
import { authFetch, mediaAbsoluteUrl } from "@/services/authApi";

const ORDER_STATUS = [
  { v: "draft", l: "Borrador" },
  { v: "submitted", l: "Enviada" },
  { v: "client_approved", l: "Solicitud aprobada" },
  { v: "art_approved", l: "Arte aprobado" },
  { v: "invoiced", l: "Facturada" },
  { v: "paid", l: "Pagada" },
  { v: "permit_pending", l: "Permiso alcaldía" },
  { v: "installation", l: "Instalación" },
  { v: "active", l: "Activa" },
  { v: "expired", l: "Vencida" },
  { v: "cancelled", l: "Cancelada" },
  { v: "rejected", l: "Rechazada" },
];

const ORDER_STATUS_FILTER_OPTIONS = [{ v: "all", l: "Todos los estados" }, ...ORDER_STATUS];

function formatPedidoAlta(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-VE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** Monto en USD con dos decimales (sin símbolo). */
function formatUsdAmount(value) {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatLineDate(d) {
  if (!d) return "—";
  const s = String(d);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, day] = s.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("es-VE", { dateStyle: "medium" });
  }
  return s;
}

function clientDisplayName(o) {
  return (
    o.client_detail?.company_name ||
    o.client_company_name ||
    ""
  ).trim();
}

/** Solo borrador puede borrarse (misma regla que el API). */
function orderIsDeletable(o) {
  return o?.status === "draft";
}

export function PedidosAdminSection() {
  const { authReady, accessToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [ready, setReady] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [filterQ, setFilterQ] = useState("");
  const [filterOrderStatus, setFilterOrderStatus] = useState("all");
  const debouncedFilterQ = useDebouncedValue(filterQ, 400);

  const filtersActive = filterQ.trim() !== "" || filterOrderStatus !== "all";

  const reloadOrders = useCallback(async () => {
    const d = await authFetch(ordersListPath(page, debouncedFilterQ, filterOrderStatus));
    const { results, count } = parsePaginatedResponse(d);
    setOrders(results);
    setTotalCount(count);
  }, [page, debouncedFilterQ, filterOrderStatus]);

  useEffect(() => {
    if (!authReady || !accessToken) return;
    let cancelled = false;
    (async () => {
      try {
        await reloadOrders();
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Error al cargar");
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, accessToken, reloadOrders]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilterQ, filterOrderStatus]);

  async function patchOrderStatus(orderId, status) {
    setErr("");
    setMsg("");
    try {
      await authFetch(`/api/orders/${orderId}/`, {
        method: "PATCH",
        body: { status },
      });
      setMsg("Estado del pedido actualizado.");
      await reloadOrders();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  async function executeDeleteOrder(orderId) {
    setErr("");
    setMsg("");
    try {
      await authFetch(`/api/orders/${orderId}/`, { method: "DELETE" });
      setMsg("Pedido eliminado.");
      if (expandedId === orderId) setExpandedId(null);
      await reloadOrders();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeleteTargetId(null);
    }
  }

  useEffect(() => {
    setExpandedId(null);
  }, [filterQ, filterOrderStatus, page]);

  if (!ready) {
    return (
      <div className={adminPanelCard}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`hidden shrink-0 animate-pulse sm:block sm:size-14 ${ROUNDED_CONTROL} bg-zinc-200/80`}
              aria-hidden
            />
            <div className="space-y-2">
              <div className={`h-7 w-40 animate-pulse ${ROUNDED_CONTROL} bg-zinc-200/80`} />
              <div className={`h-4 w-56 animate-pulse ${ROUNDED_CONTROL} bg-zinc-200/80`} />
            </div>
          </div>
          <div className={`h-10 w-36 animate-pulse ${ROUNDED_CONTROL} bg-zinc-200/80`} />
        </div>
        <PedidosSectionSkeleton />
      </div>
    );
  }

  return (
    <div className={adminPanelCard}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={adminSectionHeaderIconWrap}>
            <IconAdminClipboard className="!h-8 !w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pedidos</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {totalCount} pedido{totalCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <button
          type="button"
          className={`${adminPrimaryBtn} inline-flex items-center justify-center gap-2`}
          onClick={() => reloadOrders()}
        >
          <IconAdminRefresh className="!h-[1.125rem] !w-[1.125rem]" />
          Actualizar
        </button>
      </div>

      {msg ? (
        <p className={`mb-4 ${ROUNDED_CONTROL} bg-emerald-50 px-3 py-2 text-sm text-emerald-900`}>{msg}</p>
      ) : null}
      {err ? (
        <p className={`mb-4 break-words ${ROUNDED_CONTROL} bg-red-50 px-3 py-2 text-sm text-red-800`}>{err}</p>
      ) : null}

      {totalCount === 0 && !filtersActive ? (
        <EmptyState
          icon={<EmptyStateIconClipboard />}
          title="No hay pedidos"
          description="Cuando lleguen solicitudes de reserva desde el sitio, aparecerán aquí. Puedes pulsar «Actualizar» cuando quieras ver los últimos datos."
        />
      ) : (
        <>
          <AdminFiltersRow>
            <AdminFilterSearchInput
              id="pedidos-filter-q"
              value={filterQ}
              onChange={setFilterQ}
              placeholder="Buscar por empresa…"
            />
            <AdminFilterSelect
              id="pedidos-filter-status"
              label="Estado del pedido"
              value={filterOrderStatus}
              onChange={setFilterOrderStatus}
              options={ORDER_STATUS_FILTER_OPTIONS}
            />
            <AdminFilterClearButton
              show={filtersActive}
              onClick={() => {
                setFilterQ("");
                setFilterOrderStatus("all");
                setPage(1);
              }}
            />
          </AdminFiltersRow>

          {orders.length === 0 && filtersActive ? (
            <div className="mt-4 rounded-[15px] border border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-600">
              <p>Ningún pedido coincide con los filtros.</p>
              <div className="mt-5 flex justify-center">
                <FilterClearAction
                  onClick={() => {
                    setFilterQ("");
                    setFilterOrderStatus("all");
                    setPage(1);
                  }}
                />
              </div>
            </div>
          ) : null}

          {orders.length > 0 ? (
        <div className={`overflow-x-auto ${ROUNDED_CONTROL} border border-zinc-200`}>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="w-10 px-2 py-3" aria-hidden />
                <th className="px-3 py-2">Alta</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Total USD</th>
                <th className="whitespace-nowrap px-2 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
              const open = expandedId === o.id;
              const panelId = `pedido-extra-${o.id}`;
              return (
                <Fragment key={o.id}>
                  <tr className="border-t border-zinc-100">
                    <td className="px-2 py-2 align-middle">
                      <AdminAccordionToggle
                        expanded={open}
                        onToggle={() => setExpandedId(open ? null : o.id)}
                        rowId={o.id}
                        controlsId={panelId}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-600">
                      {formatPedidoAlta(o.created_at)}
                    </td>
                    <td className="max-w-[12rem] px-3 py-2">
                      <span className="line-clamp-2" title={clientDisplayName(o) || undefined}>
                        {clientDisplayName(o) || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="max-w-[13rem]">
                        <AdminSelect
                          id={`pedido-status-${o.id}`}
                          options={ORDER_STATUS}
                          value={o.status}
                          onChange={(v) => v != null && v !== "" && patchOrderStatus(o.id, String(v))}
                          compact
                          aria-label={`Estado pedido ${o.id}`}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-semibold tabular-nums text-zinc-900">
                        ${formatUsdAmount(o.total_amount)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 align-middle text-right">
                      <AdminRowActions
                        showEdit={false}
                        viewLabel="Ver detalle del pedido"
                        deleteLabel="Eliminar pedido"
                        showDelete={orderIsDeletable(o)}
                        deleteDisabledTitle="Solo se pueden eliminar pedidos en borrador."
                        onView={() => setExpandedId((id) => (id === o.id ? null : o.id))}
                        onDelete={() => setDeleteTargetId(o.id)}
                      />
                    </td>
                  </tr>
                  {open ? (
                    <AdminAccordionRowPanel colSpan={6} panelId={panelId} fullWidthContent>
                      <AdminAccordionDetailHeader
                        badgeText={formatPedidoAlta(o.created_at)}
                        titleLabel="Pedido"
                        titleLine={clientDisplayName(o) || "Sin nombre de empresa"}
                        hint="Resumen y líneas del pedido"
                      />

                      <div className="mt-5 grid w-full gap-6 lg:grid-cols-2 lg:gap-8">
                        <AdminDetailSection panelId={panelId} sectionId="meta" title="Datos del pedido">
                          <AdminDetailInset>
                            <AdminDetailField label="Total (USD)">
                              <span className="text-lg font-bold tabular-nums text-zinc-900">
                                ${formatUsdAmount(o.total_amount)}
                              </span>
                            </AdminDetailField>
                            <AdminDetailField label="Creada">
                              {o.created_at
                                ? new Date(o.created_at).toLocaleString("es-VE")
                                : adminDetailEmpty("")}
                            </AdminDetailField>
                            <AdminDetailField label="Enviada">
                              {o.submitted_at
                                ? new Date(o.submitted_at).toLocaleString("es-VE")
                                : adminDetailEmpty("")}
                            </AdminDetailField>
                            <AdminDetailField label="Reserva hasta">
                              {o.hold_expires_at
                                ? new Date(o.hold_expires_at).toLocaleString("es-VE")
                                : adminDetailEmpty("")}
                            </AdminDetailField>
                          </AdminDetailInset>
                        </AdminDetailSection>

                        <AdminDetailSection panelId={panelId} sectionId="lines" title="Líneas">
                          <AdminDetailInset className="space-y-2">
                            {(o.items || []).length === 0 ? (
                              <p className="text-sm text-zinc-400">Sin líneas en este pedido.</p>
                            ) : (
                              <ul className="space-y-3">
                                {o.items.map((it) => {
                                  const coverSrc = it.ad_space_cover_image
                                    ? mediaAbsoluteUrl(it.ad_space_cover_image)
                                    : "";
                                  const centerLine = [it.shopping_center_code, it.shopping_center_name]
                                    .filter(Boolean)
                                    .join(" · ");
                                  return (
                                    <li
                                      key={it.id}
                                      className={`${ROUNDED_CONTROL} flex gap-3 border border-zinc-200 bg-white p-3 sm:gap-4`}
                                    >
                                      <div
                                        className="relative h-[4.5rem] w-[6.5rem] shrink-0 overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-100 sm:h-24 sm:w-32"
                                        aria-hidden={!coverSrc}
                                      >
                                        {coverSrc ? (
                                          <img
                                            src={coverSrc}
                                            alt={
                                              it.ad_space_title
                                                ? `Portada: ${it.ad_space_title}`
                                                : it.ad_space_code
                                                  ? `Portada toma ${it.ad_space_code}`
                                                  : "Portada de la toma"
                                            }
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] font-medium uppercase leading-tight tracking-wide text-zinc-400">
                                            Sin imagen
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1 space-y-1.5 text-sm text-zinc-800">
                                        <p className="font-mono text-xs font-semibold tracking-tight text-zinc-900">
                                          {it.ad_space_code || "—"}
                                        </p>
                                        <p className="font-medium leading-snug text-zinc-900">
                                          {it.ad_space_title || "Toma"}
                                        </p>
                                        {centerLine ? (
                                          <p className="text-xs text-zinc-600">
                                            <span className="font-semibold text-zinc-700">Centro: </span>
                                            {centerLine}
                                          </p>
                                        ) : null}
                                        <p className="text-xs text-zinc-600">
                                          <span className="font-semibold text-zinc-700">Contrato: </span>
                                          {formatLineDate(it.start_date)} → {formatLineDate(it.end_date)}
                                        </p>
                                        <p className="pt-0.5 text-sm">
                                          <span className="font-semibold text-zinc-700">Subtotal: </span>
                                          <span className="font-bold tabular-nums text-zinc-900">
                                            ${formatUsdAmount(it.subtotal)} USD
                                          </span>
                                        </p>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </AdminDetailInset>
                        </AdminDetailSection>
                      </div>

                      <div className="mt-6 w-full min-w-0">
                        <AdminDetailSection panelId={panelId} sectionId="client" title="Cliente (empresa)">
                          <AdminDetailInset className="w-full min-w-0">
                            {o.client_detail ? (
                              <div className="grid w-full min-w-0 grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 sm:gap-y-5">
                                <AdminDetailField label="Empresa">
                                  {o.client_detail.company_name || adminDetailEmpty("")}
                                </AdminDetailField>
                                <AdminDetailField label="Teléfono">
                                  {o.client_detail.phone || adminDetailEmpty("")}
                                </AdminDetailField>
                                <AdminDetailField label="RIF">
                                  <span className="font-mono text-zinc-800">
                                    {o.client_detail.rif || adminDetailEmpty("")}
                                  </span>
                                </AdminDetailField>
                                <AdminDetailField label="Dirección">
                                  {o.client_detail.address || adminDetailEmpty("")}
                                </AdminDetailField>
                                <AdminDetailField label="Contacto">
                                  {o.client_detail.contact_name || adminDetailEmpty("")}
                                </AdminDetailField>
                                <AdminDetailField label="Ciudad">
                                  {o.client_detail.city || adminDetailEmpty("")}
                                </AdminDetailField>
                                <AdminDetailField label="Correo">
                                  {o.client_detail.email ? (
                                    <a
                                      href={`mailto:${encodeURIComponent(o.client_detail.email)}`}
                                      className="break-all font-medium text-zinc-900 underline-offset-2 hover:underline"
                                    >
                                      {o.client_detail.email}
                                    </a>
                                  ) : (
                                    adminDetailEmpty("")
                                  )}
                                </AdminDetailField>
                                <AdminDetailField label="Estado de la ficha (cliente)">
                                  {o.client_detail.status ? (
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${clientStatusPillClassName(o.client_detail.status)}`}
                                    >
                                      {clientStatusLabel(
                                        o.client_detail.status,
                                        o.client_detail.status_label,
                                      )}
                                    </span>
                                  ) : (
                                    adminDetailEmpty("")
                                  )}
                                </AdminDetailField>
                              </div>
                            ) : (
                              <div className="grid w-full grid-cols-1 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                  <AdminDetailField label="Empresa">
                                    {o.client_company_name || adminDetailEmpty("")}
                                  </AdminDetailField>
                                </div>
                              </div>
                            )}
                          </AdminDetailInset>
                        </AdminDetailSection>
                      </div>
                    </AdminAccordionRowPanel>
                  ) : null}
                </Fragment>
              );
              })}
            </tbody>
          </table>
        </div>
          ) : null}
          <AdminListPagination page={page} totalCount={totalCount} onPageChange={setPage} />
        </>
      )}

      <AdminConfirmDialog
        open={deleteTargetId != null}
        onClose={() => setDeleteTargetId(null)}
        title="Eliminar pedido"
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (deleteTargetId == null) return;
          await executeDeleteOrder(deleteTargetId);
        }}
      >
        <p>
          ¿Eliminar el pedido #{deleteTargetId}? Se borrarán también sus líneas e historial de estados. Esta acción no
          se puede deshacer.
        </p>
      </AdminConfirmDialog>
    </div>
  );
}

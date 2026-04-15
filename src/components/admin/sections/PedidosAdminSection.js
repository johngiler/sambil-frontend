"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import {
  AdminAccordionDetailHeader,
  AdminAccordionRowPanel,
  AdminDetailField,
  AdminDetailInset,
  AdminDetailSection,
  adminDetailEmpty,
} from "@/components/admin/AdminAccordionDetail";
import { AdminAccordionToggle } from "@/components/admin/AdminAccordionToggle";
import { AdminCopyIconButton } from "@/components/admin/AdminCopyIconButton";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { adminPanelCard, adminPrimaryBtn, adminSectionHeaderIconWrap } from "@/components/admin/adminFormStyles";
import {
  AdminFilterClearButton,
  AdminFiltersRow,
  AdminFilterSearchInput,
  AdminFilterSelect,
  FilterClearAction,
} from "@/components/admin/AdminListFilters";
import { AdminListQuerySync } from "@/components/admin/AdminListQuerySync";
import { AdminListPagination } from "@/components/admin/AdminListPagination";
import { AdminSelect } from "@/components/admin/AdminSelect";
import {
  clientStatusLabel,
  clientStatusPillClassName,
  ORDER_STATUS,
  ORDER_STATUS_FILTER_OPTIONS,
} from "@/components/admin/adminConstants";
import { IconAdminArrowDownTray, IconAdminClipboard } from "@/components/admin/adminIcons";
import { PedidosSectionSkeleton } from "@/components/admin/skeletons/PedidosSectionSkeleton";
import { CatalogSpaceLink } from "@/components/catalog/CatalogSpaceLink";
import { ImageLightbox } from "@/components/media/ImageLightbox";
import { RasterFromApiUrl } from "@/components/media/RasterFromApiUrl";
import { PaymentReceiptLightbox } from "@/components/orders/PaymentReceiptLightbox";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, EmptyStateIconClipboard } from "@/components/ui/EmptyState";
import {
  AdminDashboardFilterLink,
  dashboardCentrosSearchHref,
  dashboardClientesSearchHref,
} from "@/lib/adminDashboardLinks";
import { ordersExportReportPath, ordersListPath } from "@/lib/adminListQuery";
import { authJsonFetcher } from "@/lib/swr/fetchers";
import { catalogRasterImgAttrs } from "@/lib/catalogImageProps";
import { subtitleCityAfterCenterName } from "@/lib/shoppingCenterDisplay";
import { adminOrderLineCoverLightboxItems } from "@/lib/imageLightboxItems";
import { isPdfReceiptUrl } from "@/lib/orderPaymentMethods";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import {
  squareOrderLinePreviewFrameClass,
  squareOrderLinePreviewImgClass,
  squareListImagePreviewButtonRingClass,
} from "@/lib/squareImagePreview";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { parsePaginatedResponse } from "@/services/api";
import { authFetch, authFetchBlob, mediaAbsoluteUrl } from "@/services/authApi";

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

/** Solo lectura: lo cargó el cliente en checkout. */
function PedidoDatosPagoPortal({ order, panelId }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const receiptUrl = order?.payment_receipt_url ? mediaAbsoluteUrl(order.payment_receipt_url) : "";
  const methodLabel =
    typeof order?.payment_method_label === "string" && order.payment_method_label.trim() !== ""
      ? order.payment_method_label
      : "Sin indicar";

  const isPdf = isPdfReceiptUrl(receiptUrl);

  return (
    <>
      <AdminDetailSection panelId={panelId} sectionId="payment" title="Datos de pago">
        <AdminDetailInset className="space-y-5">
          <AdminDetailField label="Método de pago">
            <span className="font-medium text-zinc-900">{methodLabel}</span>
          </AdminDetailField>
          <AdminDetailField label="Comprobante">
            {receiptUrl ? (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className={`group flex w-full max-w-[min(100%,26rem)] flex-col overflow-hidden ${ROUNDED_CONTROL} border border-zinc-200/90 bg-zinc-200/40 text-left shadow-sm transition hover:border-[color-mix(in_srgb,var(--mp-primary)_40%,#d4d4d8)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_42%,transparent)]`}
                aria-label="Abrir comprobante en vista ampliada"
              >
                <div className="relative min-h-[11rem] w-full overflow-hidden sm:min-h-[13rem]">
                  {isPdf ? (
                    <div className="flex h-full min-h-[11rem] flex-col items-center justify-center gap-3 px-4 py-6 text-center sm:min-h-[13rem]">
                      <span className="rounded-[10px] bg-zinc-800/90 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-100">
                        PDF
                      </span>
                      <span className="max-w-[12rem] text-xs font-medium leading-snug text-zinc-600">
                        Clic para abrir en el visor.
                      </span>
                    </div>
                  ) : (
                    <img
                      src={receiptUrl}
                      alt="Miniatura del comprobante de pago"
                      className="absolute inset-0 h-full w-full object-cover"
                      {...catalogRasterImgAttrs}
                    />
                  )}
                </div>
                <span className="border-t border-zinc-200/90 bg-white px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-500 group-hover:text-zinc-800">
                  Clic para ampliar
                </span>
              </button>
            ) : (
              <p className="text-sm text-zinc-500">
                El cliente no adjuntó comprobante en el checkout.
              </p>
            )}
          </AdminDetailField>
        </AdminDetailInset>
      </AdminDetailSection>
      <PaymentReceiptLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        absoluteUrl={receiptUrl}
        showDownload
      />
    </>
  );
}

export function PedidosAdminSection() {
  const { authReady, accessToken } = useAuth();
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [lineCoverLightbox, setLineCoverLightbox] = useState({
    open: false,
    items: [],
    initialIndex: 0,
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [filterQ, setFilterQ] = useState("");
  const [filterOrderStatus, setFilterOrderStatus] = useState("all");
  const debouncedFilterQ = useDebouncedValue(filterQ, 400);

  const filtersActive = filterQ.trim() !== "" || filterOrderStatus !== "all";

  const listKey =
    authReady && accessToken ? ordersListPath(page, debouncedFilterQ, filterOrderStatus) : null;
  const { data, error: swrError, isLoading, mutate: mutateOrders } = useSWR(listKey, authJsonFetcher, {
    keepPreviousData: true,
  });

  const orders = useMemo(
    () => (data ? parsePaginatedResponse(data).results : []),
    [data],
  );
  const totalCount = useMemo(
    () => (data ? parsePaginatedResponse(data).count : 0),
    [data],
  );

  useEffect(() => {
    setErr(
      swrError ? (swrError instanceof Error ? swrError.message : String(swrError)) : "",
    );
  }, [swrError]);

  const reloadOrders = useCallback(() => mutateOrders(), [mutateOrders]);

  const downloadOrdersReport = useCallback(async () => {
    setErr("");
    setMsg("");
    setReportLoading(true);
    try {
      const path = ordersExportReportPath(debouncedFilterQ, filterOrderStatus);
      const blob = await authFetchBlob(path, { token: accessToken });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte_pedidos.xlsx";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg("Reporte descargado.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo generar el reporte.");
    } finally {
      setReportLoading(false);
    }
  }, [accessToken, debouncedFilterQ, filterOrderStatus]);

  const ready =
    !(authReady && accessToken) ||
    (!isLoading && (data !== undefined || swrError !== undefined));

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
    <>
      <AdminListQuerySync onQuery={setFilterQ} />
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
          disabled={reportLoading}
          onClick={() => downloadOrdersReport()}
        >
          <IconAdminArrowDownTray className="!h-[1.125rem] !w-[1.125rem]" />
          {reportLoading ? "Generando…" : "Generar reporte"}
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
          description="Cuando lleguen solicitudes de reserva desde el sitio, aparecerán aquí. Puedes generar un reporte Excel con «Generar reporte»."
        />
      ) : (
        <>
          <AdminFiltersRow>
            <AdminFilterSearchInput
              id="pedidos-filter-q"
              value={filterQ}
              onChange={setFilterQ}
              placeholder="Cliente, número o referencia (#…-ORDER-…)"
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
                <th className="min-w-[8.5rem] px-3 py-2">Pedido</th>
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
              const clientQ = clientDisplayName(o);
              const orderRef =
                typeof o.code === "string" && o.code.trim() ? o.code.trim() : "";
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
                    <td className="max-w-[13rem] px-3 py-2 align-middle">
                      <div className="flex items-center gap-1">
                        <span
                          className="min-w-0 flex-1 break-all font-mono text-sm font-semibold leading-snug text-zinc-800"
                          title={orderRef || `#${o.id}`}
                        >
                          {orderRef || "—"}
                        </span>
                        <AdminCopyIconButton
                          value={orderRef}
                          ariaLabel="Copiar referencia del pedido"
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-600">
                      {formatPedidoAlta(o.created_at)}
                    </td>
                    <td className="max-w-[12rem] px-3 py-2">
                      {clientQ ? (
                        <AdminDashboardFilterLink
                          href={dashboardClientesSearchHref(clientQ)}
                          className="line-clamp-2 block max-w-full"
                          title={clientQ}
                        >
                          {clientQ}
                        </AdminDashboardFilterLink>
                      ) : (
                        <span className="line-clamp-2 text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="max-w-[13rem]">
                        <AdminSelect
                          id={`pedido-status-${o.id}`}
                          options={ORDER_STATUS}
                          value={o.status}
                          onChange={(v) => v != null && v !== "" && patchOrderStatus(o.id, String(v))}
                          compact
                          aria-label={`Estado pedido ${orderRef || o.id}`}
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
                    <AdminAccordionRowPanel colSpan={7} panelId={panelId} fullWidthContent>
                      <AdminAccordionDetailHeader
                        badgeText={formatPedidoAlta(o.created_at)}
                        titleLabel="Pedido"
                        titleLine={clientDisplayName(o) || "Sin nombre de cliente"}
                        hint="Resumen y líneas del pedido"
                      />

                      <div className="mt-4 grid w-full grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-2 lg:items-start lg:gap-6 xl:gap-7">
                        <div className="min-w-0">
                        <AdminDetailSection panelId={panelId} sectionId="meta" title="Datos del pedido">
                          <AdminDetailInset>
                            <AdminDetailField label="Total (USD)">
                              <span className="text-lg font-bold tabular-nums text-zinc-900">
                                ${formatUsdAmount(o.total_amount)}
                              </span>
                            </AdminDetailField>
                            <AdminDetailField label="Referencia">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-sm font-semibold tracking-tight text-zinc-800">
                                  {orderRef || "—"}
                                </span>
                                <AdminCopyIconButton
                                  value={orderRef}
                                  ariaLabel="Copiar referencia del pedido"
                                />
                              </div>
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
                        </div>

                        <div className="min-w-0">
                          <PedidoDatosPagoPortal order={o} panelId={panelId} />
                        </div>

                        <div className="min-w-0">
                        <AdminDetailSection panelId={panelId} sectionId="lines" title="Líneas">
                          <AdminDetailInset className="space-y-2">
                            {(o.items || []).length === 0 ? (
                              <p className="text-sm text-zinc-400">Sin líneas en este pedido.</p>
                            ) : (
                              <ul className="space-y-3">
                                {o.items.map((it) => {
                                  const coverRaw =
                                    it.ad_space_cover_image && String(it.ad_space_cover_image).trim()
                                      ? String(it.ad_space_cover_image).trim()
                                      : "";
                                  const centerName = (it.shopping_center_name || "").trim();
                                  const centerSlug = (it.shopping_center_slug || "").trim();
                                  const centerCityRaw = (it.shopping_center_city || "").trim();
                                  const centerCityLine = subtitleCityAfterCenterName(
                                    centerName,
                                    centerCityRaw,
                                  );
                                  const centerHrefQ = centerSlug || centerName;
                                  return (
                                    <li
                                      key={it.id}
                                      className={`${ROUNDED_CONTROL} flex items-start gap-3 border border-zinc-200 bg-white p-3 sm:gap-4`}
                                    >
                                      {coverRaw ? (
                                        <button
                                          type="button"
                                          className={`${squareOrderLinePreviewFrameClass} ${squareListImagePreviewButtonRingClass} p-0`}
                                          aria-label={
                                            it.ad_space_title
                                              ? `Ver portada ampliada: ${it.ad_space_title}`
                                              : it.ad_space_code
                                                ? `Ver portada ampliada: ${it.ad_space_code}`
                                                : "Ver portada ampliada"
                                          }
                                          onClick={() => {
                                            const items = adminOrderLineCoverLightboxItems(it);
                                            if (items.length)
                                              setLineCoverLightbox({
                                                open: true,
                                                items,
                                                initialIndex: 0,
                                              });
                                          }}
                                        >
                                          <RasterFromApiUrl
                                            url={coverRaw}
                                            alt={
                                              it.ad_space_title
                                                ? `Portada: ${it.ad_space_title}`
                                                : it.ad_space_code
                                                  ? `Portada toma ${it.ad_space_code}`
                                                  : "Portada de la toma"
                                            }
                                            width={120}
                                            height={120}
                                            className={squareOrderLinePreviewImgClass}
                                            {...catalogRasterImgAttrs}
                                          />
                                        </button>
                                      ) : (
                                        <div
                                          className={`${squareOrderLinePreviewFrameClass} flex items-center justify-center`}
                                          aria-hidden
                                        >
                                          <div className="px-1 text-center text-[10px] font-medium uppercase leading-tight tracking-wide text-zinc-400">
                                            Sin imagen
                                          </div>
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1 space-y-1.5 text-sm text-zinc-800">
                                        <p className="text-xs">
                                          <CatalogSpaceLink spaceId={it.ad_space} variant="mono" className="font-semibold tracking-tight">
                                            {it.ad_space_code || "—"}
                                          </CatalogSpaceLink>
                                        </p>
                                        <p className="font-medium leading-snug">
                                          <CatalogSpaceLink spaceId={it.ad_space} className="text-zinc-900">
                                            {it.ad_space_title || "Toma"}
                                          </CatalogSpaceLink>
                                        </p>
                                        {centerName && centerHrefQ ? (
                                          <p className="text-xs text-zinc-600">
                                            <span className="font-semibold text-zinc-700">Centro comercial: </span>
                                            <AdminDashboardFilterLink
                                              href={dashboardCentrosSearchHref(centerHrefQ)}
                                            >
                                              {centerName}
                                            </AdminDashboardFilterLink>
                                            {centerCityLine ? (
                                              <>
                                                <span className="text-zinc-400"> · </span>
                                                <span>{centerCityLine}</span>
                                              </>
                                            ) : null}
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

                        <div className="min-w-0">
                        <AdminDetailSection panelId={panelId} sectionId="client" title="Cliente">
                          <AdminDetailInset className="w-full min-w-0">
                            {o.client_detail ? (
                              <div className="grid w-full min-w-0 grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-4">
                                <AdminDetailField label="Cliente">
                                  {o.client_detail.company_name?.trim() ? (
                                    <AdminDashboardFilterLink
                                      href={dashboardClientesSearchHref(o.client_detail.company_name.trim())}
                                    >
                                      {o.client_detail.company_name.trim()}
                                    </AdminDashboardFilterLink>
                                  ) : (
                                    adminDetailEmpty("")
                                  )}
                                </AdminDetailField>
                                <AdminDetailField label="Teléfono">
                                  {o.client_detail.phone?.trim() ? (
                                    <span className="inline-flex max-w-full flex-wrap items-center gap-1.5">
                                      <span>{o.client_detail.phone.trim()}</span>
                                      <AdminCopyIconButton
                                        value={o.client_detail.phone.trim()}
                                        ariaLabel="Copiar teléfono"
                                      />
                                    </span>
                                  ) : (
                                    adminDetailEmpty("")
                                  )}
                                </AdminDetailField>
                                <AdminDetailField label="RIF">
                                  {o.client_detail.rif?.trim() ? (
                                    <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 font-mono text-zinc-800">
                                      <span>{o.client_detail.rif.trim()}</span>
                                      <AdminCopyIconButton
                                        value={o.client_detail.rif.trim()}
                                        ariaLabel="Copiar RIF"
                                      />
                                    </span>
                                  ) : (
                                    <span className="font-mono text-zinc-800">{adminDetailEmpty("")}</span>
                                  )}
                                </AdminDetailField>
                                <AdminDetailField label="Dirección">
                                  {o.client_detail.address || adminDetailEmpty("")}
                                </AdminDetailField>
                                <AdminDetailField label="Contacto">
                                  {o.client_detail.contact_name?.trim() ? (
                                    <span className="inline-flex max-w-full flex-wrap items-center gap-1.5">
                                      <span>{o.client_detail.contact_name.trim()}</span>
                                      <AdminCopyIconButton
                                        value={o.client_detail.contact_name.trim()}
                                        ariaLabel="Copiar contacto"
                                      />
                                    </span>
                                  ) : (
                                    adminDetailEmpty("")
                                  )}
                                </AdminDetailField>
                                <AdminDetailField label="Ciudad">
                                  {o.client_detail.city || adminDetailEmpty("")}
                                </AdminDetailField>
                                <AdminDetailField label="Correo">
                                  {o.client_detail.email ? (
                                    <a
                                      href={`mailto:${encodeURIComponent(o.client_detail.email)}`}
                                      className="break-all font-medium text-zinc-900 no-underline underline-offset-2 hover:underline"
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
                                  <AdminDetailField label="Cliente">
                                    {o.client_company_name?.trim() ? (
                                      <AdminDashboardFilterLink
                                        href={dashboardClientesSearchHref(o.client_company_name.trim())}
                                      >
                                        {o.client_company_name.trim()}
                                      </AdminDashboardFilterLink>
                                    ) : (
                                      adminDetailEmpty("")
                                    )}
                                  </AdminDetailField>
                                </div>
                              </div>
                            )}
                          </AdminDetailInset>
                        </AdminDetailSection>
                        </div>
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

      <ImageLightbox
        open={lineCoverLightbox.open}
        onClose={() => setLineCoverLightbox((s) => ({ ...s, open: false }))}
        items={lineCoverLightbox.items}
        initialIndex={lineCoverLightbox.initialIndex}
        showDownload={false}
        showThumbnails={lineCoverLightbox.items.length > 1}
        ariaLabel="Imágenes de la toma en esta línea"
      />

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
    </>
  );
}

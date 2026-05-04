"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";

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
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { AdminSelect } from "@/components/admin/AdminSelect";
import {
  adminField,
  adminLabel,
  adminPanelCard,
  adminPrimaryBtn,
  adminSecondaryBtn,
  adminSectionHeaderIconWrap,
} from "@/components/admin/adminFormStyles";
import { IconAdminHardHat } from "@/components/admin/adminIcons";
import { MountingProvidersSectionSkeleton } from "@/components/admin/skeletons/MountingProvidersSectionSkeleton";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, EmptyStateIconBuilding } from "@/components/ui/EmptyState";
import { mountingProvidersListPath } from "@/lib/adminListQuery";
import {
  ADMIN_CENTERS_ALL_SWR_KEY,
  adminCentersAllPagesFetcher,
  authJsonFetcher,
} from "@/lib/swr/fetchers";
import { revalidateHomeCatalog } from "@/lib/swr/homeCatalogSwr";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { parsePaginatedResponse } from "@/services/api";
import { authFetch } from "@/services/authApi";
import { AdminListPagination } from "@/components/admin/AdminListPagination";

function activePillClass(active) {
  return active
    ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80"
    : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200/80";
}

export function MountingProvidersAdminSection() {
  const { authReady, accessToken } = useAuth();
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  /** Centro elegido en el modal (edición o alta con un solo centro). */
  const [modalShoppingCenterId, setModalShoppingCenterId] = useState("");
  /** Alta: varios centros (misma ficha de proveedor en cada CC). */
  const [modalShoppingCenterIds, setModalShoppingCenterIds] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [modal, setModal] = useState(null);
  const [editRow, setEditRow] = useState(null);

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [rif, setRif] = useState("");
  const [notes, setNotes] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const centersAllKey = authReady && accessToken ? ADMIN_CENTERS_ALL_SWR_KEY : null;
  const {
    data: centersData,
    error: centersSwrError,
    isLoading: centersLoading,
  } = useSWR(centersAllKey, adminCentersAllPagesFetcher);

  const centers = useMemo(
    () => (Array.isArray(centersData) ? centersData : []),
    [centersData],
  );

  const centerOptionsForCreate = useMemo(
    () => [
      { v: "", l: "Selecciona un centro comercial" },
      ...centers.map((c) => ({
        v: c.id,
        l: [c.name, c.city].filter(Boolean).join(" · ") || `Centro #${c.id}`,
      })),
    ],
    [centers],
  );

  const centerOptionsForEdit = useMemo(
    () =>
      centers.map((c) => ({
        v: c.id,
        l: [c.name, c.city].filter(Boolean).join(" · ") || `Centro #${c.id}`,
      })),
    [centers],
  );

  const centerOptionsForCreateMulti = useMemo(
    () =>
      centers.map((c) => ({
        v: c.id,
        l: [c.name, c.city].filter(Boolean).join(" · ") || `Centro #${c.id}`,
      })),
    [centers],
  );

  const centerLabelById = useCallback(
    (id) => {
      const c = centers.find((x) => String(x.id) === String(id));
      if (!c) return id != null && id !== "" ? `Centro #${id}` : "—";
      return [c.name, c.city].filter(Boolean).join(" · ") || `Centro #${c.id}`;
    },
    [centers],
  );

  const listKey = authReady && accessToken ? mountingProvidersListPath(page) : null;
  const {
    data: listData,
    error: listSwrError,
    isLoading: listLoading,
    mutate: mutateProviders,
  } = useSWR(listKey, authJsonFetcher, { keepPreviousData: true });

  const rows = useMemo(
    () => (listData ? parsePaginatedResponse(listData).results : []),
    [listData],
  );
  const totalCount = useMemo(
    () => (listData ? parsePaginatedResponse(listData).count : 0),
    [listData],
  );

  const reloadProviders = useCallback(async () => {
    await mutateProviders();
    await globalMutate(ADMIN_CENTERS_ALL_SWR_KEY);
    await revalidateHomeCatalog(globalMutate);
  }, [mutateProviders]);

  useEffect(() => {
    setErr(
      centersSwrError
        ? centersSwrError instanceof Error
          ? centersSwrError.message
          : String(centersSwrError)
        : listSwrError
          ? listSwrError instanceof Error
            ? listSwrError.message
            : String(listSwrError)
          : "",
    );
  }, [centersSwrError, listSwrError]);

  useEffect(() => {
    setExpandedId(null);
  }, [page]);

  function openCreate() {
    setEditRow(null);
    setModalShoppingCenterId("");
    setModalShoppingCenterIds([]);
    setCompanyName("");
    setContactName("");
    setPhone("");
    setEmail("");
    setRif("");
    setNotes("");
    setSortOrder("0");
    setIsActive(true);
    setModal("edit");
  }

  function openEdit(row) {
    setEditRow(row);
    setModalShoppingCenterIds([]);
    setModalShoppingCenterId(row.shopping_center != null ? String(row.shopping_center) : "");
    setCompanyName(String(row.company_name || ""));
    setContactName(String(row.contact_name || ""));
    setPhone(String(row.phone || ""));
    setEmail(String(row.email || ""));
    setRif(String(row.rif || ""));
    setNotes(String(row.notes || ""));
    setSortOrder(String(row.sort_order ?? 0));
    setIsActive(row.is_active !== false);
    setModal("edit");
  }

  async function saveProvider() {
    const name = companyName.trim();
    if (!name) {
      setErr("Indica el nombre de la empresa.");
      return;
    }
    if (editRow) {
      if (!modalShoppingCenterId) {
        setErr("Selecciona el centro comercial al que pertenece este proveedor.");
        return;
      }
    } else {
      const ids = modalShoppingCenterIds
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n) && n > 0);
      if (ids.length === 0) {
        setErr("Selecciona al menos un centro comercial.");
        return;
      }
    }
    setErr("");
    setMsg("");
    const so = Number.parseInt(String(sortOrder).trim(), 10);
    const payload = {
      company_name: name,
      contact_name: contactName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      rif: rif.trim(),
      notes: notes.trim(),
      sort_order: Number.isFinite(so) && so >= 0 ? so : 0,
      is_active: Boolean(isActive),
    };
    try {
      if (editRow) {
        const centerId = Number(modalShoppingCenterId);
        await authFetch(`/api/admin/mounting-providers/${editRow.id}/`, {
          method: "PATCH",
          body: {
            ...payload,
            shopping_center: centerId,
          },
        });
        setMsg("Proveedor actualizado.");
      } else {
        const ids = Array.from(
          new Set(
            modalShoppingCenterIds
              .map((n) => Number(n))
              .filter((n) => Number.isFinite(n) && n > 0),
          ),
        );
        if (ids.length === 1) {
          await authFetch("/api/admin/mounting-providers/", {
            method: "POST",
            body: {
              ...payload,
              shopping_center: ids[0],
            },
          });
          setMsg("Proveedor creado.");
        } else {
          await authFetch("/api/admin/mounting-providers/", {
            method: "POST",
            body: {
              ...payload,
              shopping_center_ids: ids,
            },
          });
          setMsg(`Proveedor registrado en ${ids.length} centros comerciales.`);
        }
      }
      setModal(null);
      setEditRow(null);
      setModalShoppingCenterId("");
      setModalShoppingCenterIds([]);
      await reloadProviders();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  async function executeDelete(id) {
    setErr("");
    setMsg("");
    try {
      await authFetch(`/api/admin/mounting-providers/${id}/`, { method: "DELETE" });
      setMsg("Proveedor eliminado.");
      if (expandedId === id) setExpandedId(null);
      await reloadProviders();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo eliminar.");
    } finally {
      setDeleteTargetId(null);
    }
  }

  const ready =
    !(authReady && accessToken) ||
    (!centersLoading && (centersData !== undefined || centersSwrError !== undefined));

  const showListSkeleton =
    Boolean(listKey) && listLoading && !listSwrError && listData == null;

  if (!ready) {
    return (
      <div className={adminPanelCard}>
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`hidden shrink-0 animate-pulse sm:block sm:size-14 ${ROUNDED_CONTROL} bg-zinc-200/80`}
            aria-hidden
          />
          <div className="space-y-2">
            <div className={`h-7 w-56 animate-pulse ${ROUNDED_CONTROL} bg-zinc-200/80`} />
            <div className={`h-4 w-72 max-w-full animate-pulse ${ROUNDED_CONTROL} bg-zinc-200/80`} />
          </div>
        </div>
        <MountingProvidersSectionSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className={adminPanelCard}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={adminSectionHeaderIconWrap}>
              <IconAdminHardHat className="!h-8 !w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Proveedores de montaje</h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Empresas autorizadas por centro; se muestran en el detalle de cada toma del catálogo.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={centers.length === 0}
            onClick={() => openCreate()}
            className={`${adminPrimaryBtn} px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Añadir proveedor
          </button>
        </div>

        {msg ? (
          <p className={`mb-4 ${ROUNDED_CONTROL} bg-emerald-50 px-3 py-2 text-sm text-emerald-900`}>{msg}</p>
        ) : null}
        {err ? (
          <p className={`mb-4 break-words ${ROUNDED_CONTROL} bg-red-50 px-3 py-2 text-sm text-red-800`}>{err}</p>
        ) : null}

        {centers.length === 0 ? (
          <EmptyState
            icon={<EmptyStateIconBuilding />}
            title="No hay centros comerciales"
            description="Crea un centro en la sección Centros comerciales antes de registrar proveedores de montaje."
          />
        ) : showListSkeleton ? (
          <MountingProvidersSectionSkeleton />
        ) : rows.length === 0 ? (
          <p className={`${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-600`}>
            No hay proveedores registrados. Usa «Añadir proveedor» y elige el centro comercial en el formulario.
          </p>
        ) : (
          <div className={`overflow-x-auto ${ROUNDED_CONTROL} border border-zinc-200`}>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="w-10 px-2 py-3" aria-hidden />
                  <th className="min-w-[8rem] px-3 py-2">Centro</th>
                  <th className="px-3 py-2">Empresa</th>
                  <th className="px-3 py-2">Contacto</th>
                  <th className="px-3 py-2">Teléfono</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="whitespace-nowrap px-2 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const open = expandedId === row.id;
                  const panelId = `mounting-provider-${row.id}`;
                  return (
                    <Fragment key={row.id}>
                      <tr className="border-t border-zinc-100">
                        <td className="px-2 py-2 align-middle">
                          <AdminAccordionToggle
                            expanded={open}
                            onToggle={() => setExpandedId(open ? null : row.id)}
                            rowId={row.id}
                            controlsId={panelId}
                          />
                        </td>
                        <td className="max-w-[10rem] px-3 py-2 align-middle text-xs text-zinc-700 sm:text-sm">
                          <span className="line-clamp-2 leading-snug">{centerLabelById(row.shopping_center)}</span>
                        </td>
                        <td className="max-w-[12rem] px-3 py-2 align-middle font-semibold text-zinc-900">
                          <span className="line-clamp-2">{row.company_name || "—"}</span>
                        </td>
                        <td className="max-w-[10rem] px-3 py-2 align-middle text-zinc-700">
                          <span className="line-clamp-2">{row.contact_name?.trim() || "—"}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 align-middle text-zinc-600">
                          {row.phone?.trim() || "—"}
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${activePillClass(
                              row.is_active !== false,
                            )}`}
                          >
                            {row.is_active !== false ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 align-middle text-right">
                          <AdminRowActions
                            onView={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                            onEdit={() => openEdit(row)}
                            onDelete={() => setDeleteTargetId(row.id)}
                            viewLabel="Ver detalle del proveedor"
                          />
                        </td>
                      </tr>
                      {open ? (
                        <AdminAccordionRowPanel colSpan={7} panelId={panelId} fullWidthContent>
                          <AdminAccordionDetailHeader
                            titleLabel="Proveedor"
                            titleLine={String(row.company_name || "").trim() || "Proveedor"}
                            hint="Datos completos y notas internas"
                          />
                          <div className="mt-4">
                            <AdminDetailSection panelId={panelId} sectionId="detail" title="Detalle">
                              <AdminDetailInset className="grid gap-4 sm:grid-cols-2">
                                <AdminDetailField label="Centro comercial">
                                  {centerLabelById(row.shopping_center)}
                                </AdminDetailField>
                                <AdminDetailField label="Correo">
                                  {row.email?.trim() ? (
                                    <a
                                      href={`mailto:${encodeURIComponent(row.email.trim())}`}
                                      className="break-all font-medium text-zinc-900 no-underline underline-offset-2 hover:underline"
                                    >
                                      {row.email.trim()}
                                    </a>
                                  ) : (
                                    adminDetailEmpty("")
                                  )}
                                </AdminDetailField>
                                <AdminDetailField label="RIF">
                                  {row.rif?.trim() ? (
                                    <span className="font-mono text-zinc-800">{row.rif.trim()}</span>
                                  ) : (
                                    adminDetailEmpty("")
                                  )}
                                </AdminDetailField>
                                <AdminDetailField label="Orden de listado">
                                  {row.sort_order != null ? String(row.sort_order) : "0"}
                                </AdminDetailField>
                                <AdminDetailField label="Alta">
                                  {row.created_at
                                    ? new Date(row.created_at).toLocaleString("es-VE")
                                    : adminDetailEmpty("")}
                                </AdminDetailField>
                                <div className="sm:col-span-2">
                                  <AdminDetailField label="Notas">
                                    {row.notes?.trim() ? (
                                      <span className="whitespace-pre-wrap text-zinc-800">{row.notes.trim()}</span>
                                    ) : (
                                      adminDetailEmpty("")
                                    )}
                                  </AdminDetailField>
                                </div>
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
        )}

        {centers.length > 0 && totalCount > 0 ? (
          <AdminListPagination page={page} totalCount={totalCount} onPageChange={setPage} />
        ) : null}
      </div>

      <AdminModal
        open={modal === "edit"}
        onClose={() => {
          setModal(null);
          setEditRow(null);
          setModalShoppingCenterId("");
          setModalShoppingCenterIds([]);
        }}
        title={editRow ? "Editar proveedor de montaje" : "Nuevo proveedor de montaje"}
        subtitle={
          editRow
            ? "Puedes cambiar el centro comercial si el proveedor opera en otro CC del mismo marketplace."
            : "Elige uno o más centros comerciales y completa los datos del proveedor autorizado para montaje."
        }
        wide
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className={`${adminSecondaryBtn} px-4 py-2 text-sm font-semibold`}
              onClick={() => {
                setModal(null);
                setEditRow(null);
                setModalShoppingCenterId("");
                setModalShoppingCenterIds([]);
              }}
            >
              Cancelar
            </button>
            <button type="button" className={`${adminPrimaryBtn} px-4 py-2 text-sm font-semibold`} onClick={() => saveProvider()}>
              Guardar
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <p className={adminLabel}>
              {editRow ? (
                <>
                  Centro comercial <span className="text-red-600">*</span>
                </>
              ) : (
                <>
                  Centros comerciales <span className="text-red-600">*</span>
                </>
              )}
            </p>
            <div className="mt-2 max-w-xl">
              {editRow ? (
                <AdminSelect
                  id="mp-shopping-center"
                  inputId="mp-shopping-center-input"
                  options={centerOptionsForEdit}
                  value={modalShoppingCenterId}
                  onChange={(v) => setModalShoppingCenterId(v != null && v !== "" ? String(v) : "")}
                  placeholder="Selecciona un centro…"
                  aria-label="Centro comercial del proveedor de montaje"
                  inModal
                />
              ) : (
                <AdminSelect
                  id="mp-shopping-centers"
                  inputId="mp-shopping-centers-input"
                  options={centerOptionsForCreateMulti}
                  value={modalShoppingCenterIds}
                  onChange={(arr) => {
                    const next = Array.isArray(arr)
                      ? arr.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0)
                      : [];
                    setModalShoppingCenterIds(next);
                  }}
                  placeholder="Selecciona uno o más centros…"
                  aria-label="Centros comerciales del proveedor de montaje"
                  inModal
                  isMulti
                  isClearable
                />
              )}
            </div>
          </div>
          <div>
            <label className={adminLabel} htmlFor="mp-company">
              Nombre de la empresa <span className="text-red-600">*</span>
            </label>
            <input
              id="mp-company"
              className={adminField}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="organization"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabel} htmlFor="mp-contact">
                Persona de contacto
              </label>
              <input
                id="mp-contact"
                className={adminField}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="mp-phone">
                Teléfono
              </label>
              <input id="mp-phone" className={adminField} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className={adminLabel} htmlFor="mp-email">
                Correo
              </label>
              <input
                id="mp-email"
                className={adminField}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="mp-rif">
                RIF
              </label>
              <input id="mp-rif" className={adminField} value={rif} onChange={(e) => setRif(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabel} htmlFor="mp-sort">
                Orden en listado
              </label>
              <input
                id="mp-sort"
                className={adminField}
                inputMode="numeric"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
              <p className="mt-1 text-xs text-zinc-500">Número menor = aparece antes en el sitio público.</p>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-800">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 accent-[color:var(--mp-primary)]"
                />
                Activo en catálogo
              </label>
            </div>
          </div>
          <div>
            <label className={adminLabel} htmlFor="mp-notes">
              Notas
            </label>
            <textarea
              id="mp-notes"
              rows={4}
              className={adminField}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        open={deleteTargetId != null}
        onClose={() => setDeleteTargetId(null)}
        title="Eliminar proveedor"
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (deleteTargetId == null) return;
          await executeDelete(deleteTargetId);
        }}
      >
        <p>
          ¿Eliminar este proveedor de montaje? Dejará de mostrarse en las tomas de este centro. Esta acción no se puede
          deshacer.
        </p>
      </AdminConfirmDialog>
    </>
  );
}

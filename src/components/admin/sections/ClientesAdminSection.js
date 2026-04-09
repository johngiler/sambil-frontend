"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";

import {
  AdminAccordionDetailHeader,
  AdminAccordionRowPanel,
  AdminDetailField,
  AdminDetailInset,
  AdminDetailSection,
  adminDetailEmpty,
} from "@/components/admin/AdminAccordionDetail";
import { AdminCopyIconButton } from "@/components/admin/AdminCopyIconButton";
import { AdminAccordionToggle } from "@/components/admin/AdminAccordionToggle";
import { AdminCreatePlusIcon } from "@/components/admin/AdminCreatePlusIcon";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import {
  adminField,
  adminLabel,
  adminPanelCard,
  adminSectionHeaderIconWrap,
  adminCreateBtnLabel,
  adminPrimaryBtn,
  adminSecondaryBtn,
  adminTableCard,
} from "@/components/admin/adminFormStyles";
import {
  CLIENT_STATUS,
  clientStatusLabel,
  clientStatusPillClassName,
} from "@/components/admin/adminConstants";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { IconAdminBriefcase, IconAdminUserPlus } from "@/components/admin/adminIcons";
import { ClientesUsuariosSectionSkeleton } from "@/components/admin/skeletons/ClientesUsuariosSectionSkeleton";
import { CoverImageField } from "@/components/admin/CoverImageField";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, EmptyStateIconBriefcase } from "@/components/ui/EmptyState";
import { clientsListPath } from "@/lib/adminListQuery";
import { ADMIN_CLIENTS_ALL_SWR_KEY, authJsonFetcher } from "@/lib/swr/fetchers";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { parsePaginatedResponse } from "@/services/api";
import { authFetch, authFetchForm, mediaAbsoluteUrl } from "@/services/authApi";
import {
  AdminFilterClearButton,
  AdminFiltersRow,
  AdminFilterSearchInput,
  AdminFilterSelect,
  FilterClearAction,
} from "@/components/admin/AdminListFilters";
import { AdminListPagination } from "@/components/admin/AdminListPagination";
import { AdminListQuerySync } from "@/components/admin/AdminListQuerySync";
import {
  AdminDashboardFilterLink,
  dashboardUsuariosSearchHref,
} from "@/lib/adminDashboardLinks";

const CLIENT_STATUS_FILTERS = [{ v: "all", l: "Todos los estados" }, ...CLIENT_STATUS];

/** Pedidos vinculados (viene del listado admin con `orders_count`). */
function clientOrdersCount(c) {
  const n = c?.orders_count;
  return typeof n === "number" && !Number.isNaN(n) ? n : 0;
}

function clientCanBeDeleted(c) {
  return clientOrdersCount(c) === 0;
}

/** Sin usuarios marketplace vinculados y con correo en ficha. */
function clientCanGenerateUser(c) {
  if (c == null) return false;
  const hasLinked =
    (Array.isArray(c.linked_usernames) && c.linked_usernames.length > 0) ||
    (Array.isArray(c.linked_user_ids) && c.linked_user_ids.length > 0);
  const em = typeof c.email === "string" && c.email.trim() !== "";
  return !hasLinked && em;
}

/** Texto de usuarios vinculados al cliente (nombres de usuario, más legible que IDs). */
function formatLinkedUsersDisplay(c) {
  if (c == null) return "—";
  if (Array.isArray(c.linked_usernames) && c.linked_usernames.length > 0) {
    return c.linked_usernames.join(", ");
  }
  if (Array.isArray(c.linked_user_ids) && c.linked_user_ids.length > 0) {
    return c.linked_user_ids.join(", ");
  }
  return "—";
}

function LinkedUsernamesAdminLinks({ usernames }) {
  if (!Array.isArray(usernames) || usernames.length === 0) return null;
  return (
    <>
      {usernames.map((uname, i) => (
        <Fragment key={uname}>
          {i > 0 ? ", " : null}
          <AdminDashboardFilterLink href={dashboardUsuariosSearchHref(uname)}>
            {uname}
          </AdminDashboardFilterLink>
        </Fragment>
      ))}
    </>
  );
}

export function ClientesAdminSection() {
  const { authReady, accessToken } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [generatingClientId, setGeneratingClientId] = useState(null);
  const [filterQ, setFilterQ] = useState("");
  const [filterClientStatus, setFilterClientStatus] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedFilterQ = useDebouncedValue(filterQ, 400);
  const filtersActive = filterQ.trim() !== "" || filterClientStatus !== "all";

  const [companyName, setCompanyName] = useState("");
  const [rif, setRif] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clStatus, setClStatus] = useState("active");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  const [coverFile, setCoverFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [pendingClearCover, setPendingClearCover] = useState(false);
  const fileRef = useRef(null);

  const listKey =
    authReady && accessToken ? clientsListPath(page, debouncedFilterQ, filterClientStatus) : null;
  const { data, error: swrError, isLoading, mutate: mutateClients } = useSWR(listKey, authJsonFetcher, {
    keepPreviousData: true,
  });

  const rows = useMemo(() => (data ? parsePaginatedResponse(data).results : []), [data]);
  const totalCount = useMemo(() => (data ? parsePaginatedResponse(data).count : 0), [data]);

  const reloadClientes = useCallback(async () => {
    await Promise.all([mutateClients(), globalMutate(ADMIN_CLIENTS_ALL_SWR_KEY)]);
  }, [mutateClients]);

  const ready =
    !(authReady && accessToken) ||
    (!isLoading && (data !== undefined || swrError !== undefined));

  useEffect(() => {
    setErr(
      swrError ? (swrError instanceof Error ? swrError.message : String(swrError)) : "",
    );
  }, [swrError]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilterQ, filterClientStatus]);

  useEffect(() => {
    if (!coverFile) {
      setFilePreview("");
      return;
    }
    const u = URL.createObjectURL(coverFile);
    setFilePreview(u);
    return () => URL.revokeObjectURL(u);
  }, [coverFile]);

  function resetForm() {
    setCompanyName("");
    setRif("");
    setContactName("");
    setEmail("");
    setPhone("");
    setClStatus("active");
    setAddress("");
    setCity("");
    setNotes("");
    setCoverFile(null);
    setPendingClearCover(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function openCreate() {
    setSelected(null);
    resetForm();
    setModal("create");
  }

  function openView(c) {
    setSelected(c);
    setModal("view");
  }

  function openEdit(c) {
    if (!c) return;
    setSelected(c);
    setCompanyName(c.company_name);
    setRif(c.rif);
    setContactName(c.contact_name || "");
    setEmail(c.email);
    setPhone(c.phone || "");
    setClStatus(c.status);
    setAddress(c.address || "");
    setCity(c.city || "");
    setNotes(c.notes || "");
    setCoverFile(null);
    setPendingClearCover(false);
    if (fileRef.current) fileRef.current.value = "";
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setSelected(null);
    resetForm();
  }

  async function generateUserForClient(c) {
    if (!c?.id || !clientCanGenerateUser(c)) return;
    setErr("");
    setMsg("");
    setGeneratingClientId(c.id);
    try {
      const data = await authFetch(`/api/clients/${c.id}/generate-user/`, { method: "POST" });
      const q = typeof data?.registration_query === "string" ? data.registration_query : "";
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const fullUrl = q && origin ? `${origin}/registro?${q}` : "";
      if (fullUrl) {
        try {
          await navigator.clipboard.writeText(fullUrl);
          setMsg(
            `Usuario generado para ${data.email || c.email}. Enlace de registro copiado al portapapeles; compártelo con el cliente.`,
          );
        } catch {
          setMsg(
            `Usuario generado para ${data.email || c.email}. Copia manualmente este enlace: ${fullUrl}`,
          );
        }
      } else {
        setMsg(`Usuario generado para ${data?.email || c.email}.`);
      }
      await reloadClientes();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo generar el usuario.");
    } finally {
      setGeneratingClientId(null);
    }
  }

  async function submitSave() {
    setErr("");
    setMsg("");
    try {
      if (modal === "create") {
        if (coverFile) {
          const fd = new FormData();
          fd.append("company_name", companyName.trim());
          fd.append("rif", rif.trim());
          fd.append("contact_name", contactName.trim());
          fd.append("email", email.trim());
          fd.append("phone", phone.trim());
          fd.append("address", address.trim());
          fd.append("city", city.trim());
          fd.append("notes", notes.trim());
          fd.append("status", clStatus);
          fd.append("cover_image", coverFile);
          await authFetchForm("/api/clients/", { method: "POST", formData: fd });
        } else {
          await authFetch("/api/clients/", {
            method: "POST",
            body: {
              company_name: companyName.trim(),
              rif: rif.trim(),
              contact_name: contactName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              address: address.trim(),
              city: city.trim(),
              notes: notes.trim(),
              status: clStatus,
            },
          });
        }
        setMsg("Cliente creado.");
      } else if (modal === "edit" && selected) {
        if (coverFile) {
          const fd = new FormData();
          fd.append("company_name", companyName.trim());
          fd.append("contact_name", contactName.trim());
          fd.append("email", email.trim());
          fd.append("phone", phone.trim());
          fd.append("address", address.trim());
          fd.append("city", city.trim());
          fd.append("notes", notes.trim());
          fd.append("status", clStatus);
          fd.append("cover_image", coverFile);
          await authFetchForm(`/api/clients/${selected.id}/`, { method: "PATCH", formData: fd });
        } else {
          const body = {
            company_name: companyName.trim(),
            contact_name: contactName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            notes: notes.trim(),
            status: clStatus,
          };
          if (pendingClearCover) body.cover_image = null;
          await authFetch(`/api/clients/${selected.id}/`, { method: "PATCH", body });
        }
        setMsg("Cliente actualizado.");
      }
      closeModal();
      await reloadClientes();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  function askDeleteClient(id) {
    setDeleteTargetId(id);
  }

  async function executeDeleteClient(id) {
    setErr("");
    try {
      await authFetch(`/api/clients/${id}/`, { method: "DELETE" });
      setMsg("Cliente eliminado.");
      await reloadClientes();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
      throw e;
    }
  }

  const readOnly = modal === "view";
  const existingCover = selected?.cover_image && !pendingClearCover ? selected.cover_image : null;

  useEffect(() => {
    setExpandedId(null);
  }, [filterQ, filterClientStatus, page]);

  if (!ready) {
    return <ClientesUsuariosSectionSkeleton />;
  }

  return (
    <>
      <AdminListQuerySync onQuery={setFilterQ} />
      <div className={adminPanelCard}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={adminSectionHeaderIconWrap}>
            <IconAdminBriefcase className="!h-8 !w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Clientes</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {totalCount} cliente{totalCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <button type="button" className={adminPrimaryBtn} onClick={openCreate}>
          <AdminCreatePlusIcon />
          <span className={adminCreateBtnLabel}>Nuevo cliente</span>
        </button>
      </div>

      {msg ? (
        <p className={`mt-4 ${ROUNDED_CONTROL} bg-emerald-50 px-3 py-2 text-sm text-emerald-900`}>{msg}</p>
      ) : null}
      {err ? (
        <p className={`mt-4 break-words ${ROUNDED_CONTROL} bg-red-50 px-3 py-2 text-sm text-red-800`}>{err}</p>
      ) : null}

      {totalCount === 0 && !filtersActive ? (
        <div className="mt-6">
          <EmptyState
            icon={<EmptyStateIconBriefcase />}
            title="No hay clientes registrados"
            description="Todavía no hay clientes dados de alta. Puedes registrar el primero con «Nuevo cliente» o aparecerán cuando un usuario complete los datos en Mi empresa."
          />
        </div>
      ) : (
        <>
          <AdminFiltersRow>
            <AdminFilterSearchInput
              id="clientes-filter-q"
              value={filterQ}
              onChange={setFilterQ}
              placeholder="Cliente, correo, contacto…"
            />
            <AdminFilterSelect
              id="clientes-filter-status"
              label="Estado de la ficha"
              value={filterClientStatus}
              onChange={setFilterClientStatus}
              options={CLIENT_STATUS_FILTERS}
            />
            <AdminFilterClearButton
              show={filtersActive}
              onClick={() => {
                setFilterQ("");
                setFilterClientStatus("all");
                setPage(1);
              }}
            />
          </AdminFiltersRow>

          {rows.length === 0 && filtersActive ? (
            <div className="mt-6 rounded-[15px] border border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-600">
              <p>Ningún cliente coincide con los filtros.</p>
              <div className="mt-5 flex justify-center">
                <FilterClearAction
                  onClick={() => {
                    setFilterQ("");
                    setFilterClientStatus("all");
                    setPage(1);
                  }}
                />
              </div>
            </div>
          ) : null}

          {rows.length > 0 ? (
        <div className={`mt-6 ${adminTableCard}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/90">
                  <th className="w-8 px-2 py-3" aria-hidden />
                  <th className="px-2 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Foto
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Cliente
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Email
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Usuarios vinculados
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Estado
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                const open = expandedId === c.id;
                const panelId = `cliente-extra-${c.id}`;
                const linkedUsersText = formatLinkedUsersDisplay(c);
                return (
                  <Fragment key={c.id}>
                    <tr className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/70">
                      <td className="px-2 py-2.5">
                        <AdminAccordionToggle
                          expanded={open}
                          onToggle={() => setExpandedId(open ? null : c.id)}
                          rowId={c.id}
                          controlsId={panelId}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex h-11 w-11 overflow-hidden rounded-full border border-zinc-100 bg-zinc-100">
                          {c.cover_image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={mediaAbsoluteUrl(c.cover_image)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="max-w-[10rem] truncate px-3 py-2.5 font-medium text-zinc-900" title={c.company_name}>
                        {c.company_name}
                      </td>
                      <td className="max-w-[14rem] px-3 py-2.5 text-sm text-zinc-800">
                        {c.email?.trim() ? (
                          <a
                            href={`mailto:${encodeURIComponent(c.email.trim())}`}
                            className="block truncate font-medium text-zinc-900 no-underline underline-offset-2 hover:underline"
                            title={c.email.trim()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {c.email.trim()}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="max-w-[16rem] px-3 py-2 align-middle text-zinc-700">
                        {clientCanGenerateUser(c) ? (
                          <button
                            type="button"
                            className={`${adminSecondaryBtn} !justify-start gap-1.5 px-2.5 py-1.5 text-left text-xs font-semibold`}
                            title="Crea usuario sin contraseña y copia el enlace para que definan su clave"
                            disabled={generatingClientId === c.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              void generateUserForClient(c);
                            }}
                          >
                            <IconAdminUserPlus className="!h-4 !w-4 shrink-0" />
                            <span className="min-w-0">
                              {generatingClientId === c.id ? "Generando…" : "Generar usuario"}
                            </span>
                          </button>
                        ) : (
                          <span className="block truncate" title={linkedUsersText}>
                            {Array.isArray(c.linked_usernames) && c.linked_usernames.length > 0 ? (
                              <LinkedUsernamesAdminLinks usernames={c.linked_usernames} />
                            ) : (
                              linkedUsersText
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${clientStatusPillClassName(c.status)}`}
                        >
                          {clientStatusLabel(c.status, c.status_label)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <AdminRowActions
                          onView={() => openView(c)}
                          onEdit={() => openEdit(c)}
                          showDelete={clientCanBeDeleted(c)}
                          deleteDisabledTitle="Tiene pedidos relacionados. Revisa la sección Pedidos antes de eliminar."
                          onDelete={() => askDeleteClient(c.id)}
                        />
                      </td>
                    </tr>
                    {open ? (
                      <AdminAccordionRowPanel colSpan={7} panelId={panelId}>
                        <AdminAccordionDetailHeader
                          badgeText={typeof c.rif === "string" && c.rif.trim() !== "" ? c.rif.trim() : undefined}
                          titleLabel="Cliente en sistema"
                          titleLine={c.company_name}
                          hint="Datos de contacto y ubicación"
                        />

                        <div className="mt-5 grid gap-6 lg:grid-cols-2">
                          <AdminDetailSection panelId={panelId} sectionId="contact" title="Contacto">
                            <AdminDetailInset>
                              <AdminDetailField label="Usuarios vinculados">
                                {Array.isArray(c.linked_usernames) && c.linked_usernames.length > 0 ? (
                                  <span className="text-sm text-zinc-800">
                                    <LinkedUsernamesAdminLinks usernames={c.linked_usernames} />
                                  </span>
                                ) : linkedUsersText !== "—" ? (
                                  <span className="text-sm text-zinc-800">{linkedUsersText}</span>
                                ) : (
                                  <span className="text-sm text-zinc-400">
                                    Ninguno · usa «Generar usuario» en la columna Usuarios vinculados o crea la cuenta
                                    en Usuarios
                                  </span>
                                )}
                              </AdminDetailField>
                              <AdminDetailField label="Persona de contacto">
                                {c.contact_name?.trim() ? (
                                  <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 text-sm text-zinc-800">
                                    <span>{c.contact_name.trim()}</span>
                                    <AdminCopyIconButton
                                      value={c.contact_name.trim()}
                                      ariaLabel="Copiar persona de contacto"
                                    />
                                  </span>
                                ) : (
                                  adminDetailEmpty("")
                                )}
                              </AdminDetailField>
                              <AdminDetailField label="Email">
                                {c.email?.trim() ? (
                                  <a
                                    href={`mailto:${c.email.trim()}`}
                                    className="break-all font-medium text-zinc-900 no-underline underline-offset-2 hover:underline"
                                  >
                                    {c.email.trim()}
                                  </a>
                                ) : (
                                  adminDetailEmpty("")
                                )}
                              </AdminDetailField>
                              <AdminDetailField label="RIF">
                                {c.rif?.trim() ? (
                                  <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 font-mono text-sm text-zinc-800">
                                    <span>{c.rif.trim()}</span>
                                    <AdminCopyIconButton value={c.rif.trim()} ariaLabel="Copiar RIF" />
                                  </span>
                                ) : (
                                  <span className="font-mono text-sm text-zinc-800">{adminDetailEmpty("")}</span>
                                )}
                              </AdminDetailField>
                              <AdminDetailField label="Teléfono">
                                {c.phone?.trim() ? (
                                  <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 text-sm text-zinc-800">
                                    <span>{c.phone.trim()}</span>
                                    <AdminCopyIconButton
                                      value={c.phone.trim()}
                                      ariaLabel="Copiar teléfono"
                                    />
                                  </span>
                                ) : (
                                  adminDetailEmpty("")
                                )}
                              </AdminDetailField>
                            </AdminDetailInset>
                          </AdminDetailSection>

                          <AdminDetailSection panelId={panelId} sectionId="ubic" title="Ubicación">
                            <AdminDetailInset>
                              <AdminDetailField label="Ciudad">{adminDetailEmpty(c.city)}</AdminDetailField>
                              <AdminDetailField label="Dirección fiscal / oficina">
                                {adminDetailEmpty(c.address)}
                              </AdminDetailField>
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
        </div>
          ) : null}
          <AdminListPagination page={page} totalCount={totalCount} onPageChange={setPage} />
        </>
      )}

      <AdminModal
        open={modal != null}
        onClose={closeModal}
        title={
          modal === "create"
            ? "Nuevo cliente"
            : modal === "edit"
              ? "Editar cliente"
              : "Detalle del cliente"
        }
        subtitle={modal === "view" ? selected?.company_name : undefined}
        wide
        footer={
          readOnly ? (
            <div className="flex justify-end gap-2">
              <button type="button" className={adminSecondaryBtn} onClick={closeModal}>
                Cerrar
              </button>
              <button type="button" className={adminPrimaryBtn} onClick={() => openEdit(selected)}>
                Editar
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className={adminSecondaryBtn} onClick={closeModal}>
                Cancelar
              </button>
              <button type="button" className={adminPrimaryBtn} onClick={submitSave}>
                {modal === "create" ? "Crear" : "Guardar"}
              </button>
            </div>
          )
        }
      >
        {readOnly && selected ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CoverImageField readOnly variant="avatar" existingUrl={selected.cover_image} />
            </div>
            <div className="sm:col-span-2">
              <p className={adminLabel}>Razón social</p>
              <p className="mt-1 font-medium text-zinc-900">{selected.company_name}</p>
            </div>
            <div>
              <p className={adminLabel}>RIF</p>
              <p className="mt-1 inline-flex flex-wrap items-center gap-1.5 font-mono text-sm text-zinc-800">
                <span>{selected.rif?.trim() || "—"}</span>
                {selected.rif?.trim() ? (
                  <AdminCopyIconButton value={selected.rif.trim()} ariaLabel="Copiar RIF" />
                ) : null}
              </p>
            </div>
            <div>
              <p className={adminLabel}>Estado</p>
              <p className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${clientStatusPillClassName(selected.status)}`}
                >
                  {clientStatusLabel(selected.status, selected.status_label)}
                </span>
              </p>
            </div>
            <div>
              <p className={adminLabel}>Contacto</p>
              <p className="mt-1 inline-flex flex-wrap items-center gap-1.5 text-sm text-zinc-800">
                <span>{selected.contact_name?.trim() || "—"}</span>
                {selected.contact_name?.trim() ? (
                  <AdminCopyIconButton
                    value={selected.contact_name.trim()}
                    ariaLabel="Copiar persona de contacto"
                  />
                ) : null}
              </p>
            </div>
            <div>
              <p className={adminLabel}>Usuarios vinculados</p>
              <p className="mt-1 text-sm text-zinc-800">
                {Array.isArray(selected.linked_usernames) && selected.linked_usernames.length > 0 ? (
                  <LinkedUsernamesAdminLinks usernames={selected.linked_usernames} />
                ) : (
                  formatLinkedUsersDisplay(selected)
                )}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Solo lectura. Puedes usar «Generar usuario» en la columna Usuarios vinculados (enlace para definir
                contraseña) o enlazar cuentas en Usuarios con rol «Cliente marketplace». Varias cuentas pueden compartir
                la misma ficha.
              </p>
            </div>
            <div>
              <p className={adminLabel}>Email</p>
              <p className="mt-1 text-sm text-zinc-800">{selected.email}</p>
            </div>
            <div>
              <p className={adminLabel}>Teléfono</p>
              <p className="mt-1 inline-flex flex-wrap items-center gap-1.5 text-sm text-zinc-800">
                <span>{selected.phone?.trim() || "—"}</span>
                {selected.phone?.trim() ? (
                  <AdminCopyIconButton value={selected.phone.trim()} ariaLabel="Copiar teléfono" />
                ) : null}
              </p>
            </div>
            <div>
              <p className={adminLabel}>Ciudad</p>
              <p className="mt-1 text-sm text-zinc-800">{selected.city?.trim() || "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className={adminLabel}>Dirección fiscal / oficina</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">
                {selected.address?.trim() || "—"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className={adminLabel}>Notas internas</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
                {selected.notes?.trim() || "—"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CoverImageField
                readOnly={false}
                variant="avatar"
                existingUrl={existingCover}
                filePreviewUrl={filePreview}
                onFileChange={(f) => {
                  setCoverFile(f);
                  setPendingClearCover(false);
                }}
                onClearExisting={() => {
                  setPendingClearCover(true);
                  setCoverFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                fileInputRef={fileRef}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="cl-name">
                Razón social
              </label>
              <input
                id="cl-name"
                className={adminField}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="cl-rif">
                RIF
              </label>
              <input
                id="cl-rif"
                className={adminField}
                value={rif}
                onChange={(e) => setRif(e.target.value)}
                required
                disabled={modal === "edit"}
              />
              {modal === "edit" ? (
                <p className="mt-1 text-xs text-zinc-500">El RIF no se puede cambiar.</p>
              ) : null}
            </div>
            <div>
              <label className={adminLabel} htmlFor="cl-status">
                Estado
              </label>
              <AdminSelect
                id="cl-status"
                options={CLIENT_STATUS}
                value={clStatus}
                onChange={(v) => setClStatus(v || "active")}
                inModal
                aria-label="Estado del cliente"
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="cl-contact">
                Contacto
              </label>
              <input
                id="cl-contact"
                className={adminField}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="cl-email">
                Email
              </label>
              <input
                id="cl-email"
                type="email"
                className={adminField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="cl-phone">
                Teléfono
              </label>
              <input
                id="cl-phone"
                className={adminField}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="cl-city">
                Ciudad
              </label>
              <input id="cl-city" className={adminField} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="cl-address">
                Dirección
              </label>
              <textarea
                id="cl-address"
                className={adminField}
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="cl-notes">
                Notas internas
              </label>
              <textarea
                id="cl-notes"
                className={adminField}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Solo visibles en el panel"
              />
            </div>
          </div>
        )}
      </AdminModal>

      <AdminConfirmDialog
        open={deleteTargetId != null}
        onClose={() => setDeleteTargetId(null)}
        title="Eliminar cliente"
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (deleteTargetId == null) return;
          await executeDeleteClient(deleteTargetId);
        }}
      >
        <p>
          ¿Eliminar este cliente del sistema? Solo aparece esta opción si no tiene pedidos vinculados. Esta acción no se
          puede deshacer.
        </p>
      </AdminConfirmDialog>
    </div>
    </>
  );
}

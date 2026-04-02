"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AdminAccordionDetailHeader,
  AdminAccordionRowPanel,
  AdminDetailField,
  AdminDetailInset,
  AdminDetailSection,
  adminDetailEmpty,
} from "@/components/admin/AdminAccordionDetail";
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
import { AdminSelect } from "@/components/admin/AdminSelect";
import { IconAdminUserPlus } from "@/components/admin/adminIcons";
import { ClientesUsuariosSectionSkeleton } from "@/components/admin/skeletons/ClientesUsuariosSectionSkeleton";
import { CoverImageField } from "@/components/admin/CoverImageField";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, EmptyStateIconUsers } from "@/components/ui/EmptyState";
import { usersAdminListPath } from "@/lib/adminListQuery";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { parsePaginatedResponse } from "@/services/api";
import { authFetch, authFetchAllPages, authFetchForm, mediaAbsoluteUrl } from "@/services/authApi";
import {
  AdminFilterClearButton,
  AdminFiltersRow,
  AdminFilterSearchInput,
  AdminFilterSelect,
  FilterClearAction,
} from "@/components/admin/AdminListFilters";
import { AdminListPagination } from "@/components/admin/AdminListPagination";

const ROLE_OPTIONS = [
  { v: "client", l: "Cliente marketplace" },
  { v: "admin", l: "Administrador" },
];

const ROLE_FILTER_OPTIONS = [{ v: "all", l: "Todos los roles" }, ...ROLE_OPTIONS];

function roleLabel(role) {
  const o = ROLE_OPTIONS.find((x) => x.v === role);
  return o ? o.l : role;
}

export function UsuariosAdminSection() {
  const { authReady, accessToken, me, refreshUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [ready, setReady] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [filterQ, setFilterQ] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const debouncedFilterQ = useDebouncedValue(filterQ, 400);
  const filtersActive = filterQ.trim() !== "" || filterRole !== "all";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [linkedClientId, setLinkedClientId] = useState("");
  const [clientRows, setClientRows] = useState([]);

  const [coverFile, setCoverFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [pendingClearCover, setPendingClearCover] = useState(false);
  const fileRef = useRef(null);

  const reload = useCallback(async () => {
    const d = await authFetch(usersAdminListPath(page, debouncedFilterQ, filterRole));
    const { results, count } = parsePaginatedResponse(d);
    setRows(results);
    setTotalCount(count);
  }, [page, debouncedFilterQ, filterRole]);

  const reloadClients = useCallback(async () => {
    try {
      const all = await authFetchAllPages("/api/clients/?page_size=100");
      setClientRows(all);
    } catch {
      setClientRows([]);
    }
  }, []);

  const clientSelectOptions = useMemo(() => {
    const base = [{ v: "", l: "Sin empresa vinculada" }];
    return base.concat(
      clientRows.map((c) => ({
        v: String(c.id),
        l: `${c.company_name} · ID ${c.id}`,
      })),
    );
  }, [clientRows]);

  useEffect(() => {
    if (!authReady || !accessToken) return;
    let cancelled = false;
    (async () => {
      try {
        await reload();
        await reloadClients();
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Error al cargar");
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, accessToken, reload, reloadClients]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilterQ, filterRole]);

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
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("client");
    setLinkedClientId("");
    setCoverFile(null);
    setPendingClearCover(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function openCreate() {
    setSelected(null);
    resetForm();
    setModal("create");
    void reloadClients();
  }

  function openView(u) {
    setSelected(u);
    setModal("view");
  }

  function openEdit(u) {
    if (!u) return;
    void reloadClients();
    setSelected(u);
    setUsername(u.username);
    setEmail(u.email || "");
    setPassword("");
    setRole(u.role || "client");
    setLinkedClientId(u.client_id != null ? String(u.client_id) : "");
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

  async function submitSave() {
    setErr("");
    setMsg("");
    try {
      if (modal === "create") {
        if (password.length < 8) {
          setErr("La contraseña debe tener al menos 8 caracteres.");
          return;
        }
        if (coverFile) {
          const fd = new FormData();
          fd.append("username", username.trim());
          fd.append("email", email.trim());
          fd.append("password", password);
          fd.append("role", role);
          fd.append("cover_image", coverFile);
          if (role === "client") fd.append("client_id", linkedClientId || "");
          await authFetchForm("/api/admin/users/", { method: "POST", formData: fd });
        } else {
          await authFetch("/api/admin/users/", {
            method: "POST",
            body: {
              username: username.trim(),
              email: email.trim(),
              password,
              role,
              ...(role === "client"
                ? { client_id: linkedClientId ? parseInt(linkedClientId, 10) : null }
                : {}),
            },
          });
        }
        setMsg("Usuario creado.");
      } else if (modal === "edit" && selected) {
        if (password && password.length < 8) {
          setErr("La contraseña debe tener al menos 8 caracteres.");
          return;
        }
        if (coverFile) {
          const fd = new FormData();
          fd.append("email", email.trim());
          fd.append("role", role);
          if (password.trim()) fd.append("password", password.trim());
          fd.append("cover_image", coverFile);
          if (role === "client") fd.append("client_id", linkedClientId ? linkedClientId : "");
          await authFetchForm(`/api/admin/users/${selected.id}/`, { method: "PATCH", formData: fd });
        } else {
          const body = {
            email: email.trim(),
            role,
          };
          if (password.trim()) body.password = password.trim();
          if (pendingClearCover) body.cover_image = null;
          if (role === "client") body.client_id = linkedClientId ? parseInt(linkedClientId, 10) : null;
          await authFetch(`/api/admin/users/${selected.id}/`, { method: "PATCH", body });
        }
        setMsg("Usuario actualizado.");
        if (me && selected.id === me.id) {
          await refreshUser();
        }
      }
      closeModal();
      await reload();
      await reloadClients();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  function askDeleteUser(u) {
    if (u.id === me?.id) {
      setErr("No puedes eliminar tu propio usuario.");
      return;
    }
    setPendingDeleteUser(u);
  }

  async function executeDeleteUser(u) {
    setErr("");
    try {
      await authFetch(`/api/admin/users/${u.id}/`, { method: "DELETE" });
      setMsg("Usuario eliminado.");
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
      throw e;
    }
  }

  const readOnly = modal === "view";
  const existingCover = selected?.cover_image && !pendingClearCover ? selected.cover_image : null;

  useEffect(() => {
    setExpandedId(null);
  }, [filterQ, filterRole, page]);

  if (!ready) {
    return <ClientesUsuariosSectionSkeleton />;
  }

  return (
    <div className={adminPanelCard}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={adminSectionHeaderIconWrap}>
            <IconAdminUserPlus className="!h-8 !w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Usuarios</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {totalCount} usuario{totalCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <button type="button" className={adminPrimaryBtn} onClick={openCreate}>
          <AdminCreatePlusIcon />
          <span className={adminCreateBtnLabel}>Nuevo usuario</span>
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
            icon={<EmptyStateIconUsers />}
            title="No hay usuarios registrados"
            description="Todavía no hay cuentas en el sistema. Puedes crear la primera con «Nuevo usuario»."
          />
        </div>
      ) : (
        <>
          <AdminFiltersRow>
            <AdminFilterSearchInput
              id="usuarios-filter-q"
              value={filterQ}
              onChange={setFilterQ}
              placeholder="Usuario, correo, empresa…"
            />
            <AdminFilterSelect
              id="usuarios-filter-role"
              label="Rol"
              value={filterRole}
              onChange={setFilterRole}
              options={ROLE_FILTER_OPTIONS}
            />
            <AdminFilterClearButton
              show={filtersActive}
              onClick={() => {
                setFilterQ("");
                setFilterRole("all");
                setPage(1);
              }}
            />
          </AdminFiltersRow>

          {rows.length === 0 && filtersActive ? (
            <div className="mt-6 rounded-[15px] border border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-600">
              <p>Ningún usuario coincide con los filtros.</p>
              <div className="mt-5 flex justify-center">
                <FilterClearAction
                  onClick={() => {
                    setFilterQ("");
                    setFilterRole("all");
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
                    Usuario
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Email
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Rol
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => {
                const isSelf = u.id === me?.id;
                const open = expandedId === u.id;
                const panelId = `usuario-extra-${u.id}`;
                return (
                  <Fragment key={u.id}>
                    <tr className="border-b border-zinc-100 transition-colors hover:bg-sky-50/40">
                      <td className="px-2 py-2.5">
                        <AdminAccordionToggle
                          expanded={open}
                          onToggle={() => setExpandedId(open ? null : u.id)}
                          rowId={u.id}
                          controlsId={panelId}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex h-11 w-11 overflow-hidden rounded-full border border-zinc-100 bg-zinc-100">
                          {u.cover_image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={mediaAbsoluteUrl(u.cover_image)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-zinc-900">
                        {u.username}
                        {isSelf ? (
                          <span className="ml-2 text-xs font-normal text-[#0c9dcf]">Tu sesión</span>
                        ) : null}
                      </td>
                      <td className="max-w-[12rem] truncate px-3 py-2.5 text-zinc-600" title={u.email}>
                        {u.email || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-700">{roleLabel(u.role)}</td>
                      <td className="px-3 py-2">
                        <AdminRowActions
                          onView={() => openView(u)}
                          onEdit={() => openEdit(u)}
                          onDelete={() => askDeleteUser(u)}
                          showDelete={!isSelf}
                          deleteDisabledTitle="No puedes eliminar tu propio usuario"
                        />
                      </td>
                    </tr>
                    {open ? (
                      <AdminAccordionRowPanel colSpan={6} panelId={panelId}>
                        <AdminAccordionDetailHeader
                          badgeText={`ID ${u.id}`}
                          titleLabel="Usuario"
                          titleLine={
                            <p className="truncate text-sm font-medium text-zinc-900">
                              {u.username}
                              {isSelf ? (
                                <span className="ml-2 text-xs font-normal text-[#0c9dcf]">Tu sesión</span>
                              ) : null}
                            </p>
                          }
                          hint="Permisos y alta en el sistema"
                        />

                        <div className="mt-5">
                          <AdminDetailSection panelId={panelId} sectionId="account" title="Cuenta y permisos">
                            <AdminDetailInset>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <AdminDetailField label="Rol">{roleLabel(u.role)}</AdminDetailField>
                                <AdminDetailField label="Email">
                                  {u.email?.trim() ? (
                                    <a
                                      href={`mailto:${u.email.trim()}`}
                                      className="break-all font-medium text-[#0c9dcf] underline-offset-2 hover:underline"
                                    >
                                      {u.email.trim()}
                                    </a>
                                  ) : (
                                    adminDetailEmpty("")
                                  )}
                                </AdminDetailField>
                                <AdminDetailField label="Equipo interno">{u.is_staff ? "Sí" : "No"}</AdminDetailField>
                                <AdminDetailField label="Acceso total">{u.is_superuser ? "Sí" : "No"}</AdminDetailField>
                                <AdminDetailField label="Fecha de alta">
                                  {u.date_joined
                                    ? new Date(u.date_joined).toLocaleString("es-VE")
                                    : adminDetailEmpty("")}
                                </AdminDetailField>
                                {u.role === "client" ? (
                                  <AdminDetailField label="Empresa vinculada">
                                    {u.client_company_name
                                      ? `${u.client_company_name} (ID ${u.client_id})`
                                      : adminDetailEmpty("")}
                                  </AdminDetailField>
                                ) : null}
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
            ? "Nuevo usuario"
            : modal === "edit"
              ? "Editar usuario"
              : "Detalle del usuario"
        }
        subtitle={modal === "view" ? selected?.username : undefined}
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
            <div>
              <p className={adminLabel}>Usuario</p>
              <p className="mt-1 font-mono text-sm font-medium text-zinc-900">{selected.username}</p>
            </div>
            <div>
              <p className={adminLabel}>Rol</p>
              <p className="mt-1 text-sm text-zinc-800">{roleLabel(selected.role)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className={adminLabel}>Email</p>
              <p className="mt-1 text-sm text-zinc-800">{selected.email || "—"}</p>
            </div>
            <div>
              <p className={adminLabel}>Equipo interno</p>
              <p className="mt-1 text-sm text-zinc-800">{selected.is_staff ? "Sí" : "No"}</p>
            </div>
            <div>
              <p className={adminLabel}>Acceso total</p>
              <p className="mt-1 text-sm text-zinc-800">{selected.is_superuser ? "Sí" : "No"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className={adminLabel}>Alta</p>
              <p className="mt-1 text-sm text-zinc-800">
                {selected.date_joined
                  ? new Date(selected.date_joined).toLocaleString("es-VE")
                  : "—"}
              </p>
            </div>
            {selected.role === "client" ? (
              <div className="sm:col-span-2">
                <p className={adminLabel}>Empresa vinculada</p>
                <p className="mt-1 text-sm text-zinc-800">
                  {selected.client_company_name
                    ? `${selected.client_company_name} (ID ${selected.client_id})`
                    : "—"}
                </p>
              </div>
            ) : null}
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
              <label className={adminLabel} htmlFor="u-user">
                Nombre de usuario
              </label>
              <input
                id="u-user"
                className={adminField}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={modal === "create"}
                disabled={modal === "edit"}
                autoComplete="off"
              />
              {modal === "edit" ? (
                <p className="mt-1 text-xs text-zinc-500">El nombre de usuario no se puede cambiar.</p>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="u-email">
                Email
              </label>
              <input
                id="u-email"
                type="email"
                className={adminField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="u-pass">
                {modal === "create" ? "Contraseña inicial" : "Nueva contraseña (opcional)"}
              </label>
              <input
                id="u-pass"
                type="password"
                className={adminField}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={modal === "create"}
                minLength={modal === "create" ? 8 : undefined}
                autoComplete="new-password"
                placeholder={modal === "edit" ? "Dejar vacío para no cambiar" : ""}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="u-role">
                Rol
              </label>
              <AdminSelect
                id="u-role"
                options={ROLE_OPTIONS}
                value={role}
                onChange={(v) => {
                  const r = v || "client";
                  setRole(r);
                  if (r === "admin") setLinkedClientId("");
                }}
                inModal
                aria-label="Rol de usuario"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Los administradores pueden gestionar el panel y crear usuarios. Si cambias el rol, la persona
                puede necesitar cerrar sesión e iniciar de nuevo para que se apliquen los permisos.
              </p>
            </div>
            {role === "client" ? (
              <div className="sm:col-span-2">
                <label className={adminLabel} htmlFor="u-client">
                  Cliente (empresa) vinculado
                </label>
                <AdminSelect
                  id="u-client"
                  options={clientSelectOptions}
                  value={linkedClientId}
                  onChange={(v) => setLinkedClientId(v != null && v !== "" ? String(v) : "")}
                  inModal
                  isSearchable
                  placeholder="Buscar por razón social o ID…"
                  aria-label="Seleccionar ficha de cliente a vincular"
                />
                {clientRows.length === 0 ? (
                  <p className="mt-1 text-xs text-amber-800">
                    No hay fichas en Clientes. Crea primero una empresa en la sección Clientes para poder
                    seleccionarla aquí.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-zinc-500">
                    Vincula la ficha de empresa al usuario. Un usuario → una empresa; la misma empresa puede tener
                    varios usuarios.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        )}
      </AdminModal>

      <AdminConfirmDialog
        open={pendingDeleteUser != null}
        onClose={() => setPendingDeleteUser(null)}
        title="Eliminar usuario"
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!pendingDeleteUser) return;
          await executeDeleteUser(pendingDeleteUser);
        }}
      >
        <p>
          ¿Eliminar al usuario{" "}
          <span className="font-semibold text-zinc-900">&quot;{pendingDeleteUser?.username}&quot;</span>? Esta acción no se
          puede deshacer.
        </p>
      </AdminConfirmDialog>
    </div>
  );
}

"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import {
  AdminAccordionDetailHeader,
  AdminAccordionRowPanel,
  AdminDetailField,
  AdminDetailInset,
  AdminDetailProse,
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
import { SPACE_STATUS, SPACE_TYPES } from "@/components/admin/adminConstants";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { CoverImageField } from "@/components/admin/CoverImageField";
import { IconAdminGrid } from "@/components/admin/adminIcons";
import { TomasAdminSectionSkeleton } from "@/components/admin/skeletons/TomasAdminSectionSkeleton";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, EmptyStateIconGrid } from "@/components/ui/EmptyState";
import { spacesAdminListPath } from "@/lib/adminListQuery";
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

const SPACE_STATUS_FILTERS = [{ v: "all", l: "Todos los estados" }, ...SPACE_STATUS];

function buildSpacePayload(fd, values) {
  const {
    code,
    shopping_center,
    type,
    title,
    description,
    monthly_price_usd,
    status,
    width,
    height,
    quantity,
    material,
    location_description,
    level,
    venue_zone,
    double_sided,
    production_specs,
    installation_notes,
    hem_pocket_top_cm,
  } = values;
  fd.append("code", code.trim());
  fd.append("shopping_center", String(shopping_center));
  fd.append("type", type);
  fd.append("title", title.trim());
  fd.append("description", description.trim());
  fd.append("monthly_price_usd", String(monthly_price_usd).trim());
  fd.append("status", status);
  fd.append("double_sided", double_sided ? "true" : "false");
  if (width.trim()) fd.append("width", width.trim());
  if (height.trim()) fd.append("height", height.trim());
  if (quantity.trim()) fd.append("quantity", quantity.trim());
  if (material.trim()) fd.append("material", material.trim());
  if (location_description.trim()) fd.append("location_description", location_description.trim());
  if (level.trim()) fd.append("level", level.trim());
  if (venue_zone.trim()) fd.append("venue_zone", venue_zone.trim());
  if (production_specs.trim()) fd.append("production_specs", production_specs.trim());
  if (installation_notes.trim()) fd.append("installation_notes", installation_notes.trim());
  if (hem_pocket_top_cm.trim()) fd.append("hem_pocket_top_cm", hem_pocket_top_cm.trim());
}

function spaceTypeLabel(v) {
  const o = SPACE_TYPES.find((t) => t.v === v);
  return o ? o.l : v;
}

export function TomasAdminSection() {
  const { authReady, accessToken } = useAuth();
  const [centers, setCenters] = useState([]);
  const [rows, setRows] = useState([]);
  const [ready, setReady] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [filterQ, setFilterQ] = useState("");
  const [filterSpaceStatus, setFilterSpaceStatus] = useState("all");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const debouncedFilterQ = useDebouncedValue(filterQ, 400);
  const filtersActive = filterQ.trim() !== "" || filterSpaceStatus !== "all";

  const [shoppingCenter, setShoppingCenter] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("billboard");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [status, setStatus] = useState("available");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [material, setMaterial] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [level, setLevel] = useState("");
  const [venueZone, setVenueZone] = useState("");
  const [doubleSided, setDoubleSided] = useState(false);
  const [productionSpecs, setProductionSpecs] = useState("");
  const [installationNotes, setInstallationNotes] = useState("");
  const [hemPocketTopCm, setHemPocketTopCm] = useState("");

  const [coverFile, setCoverFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [pendingClearCover, setPendingClearCover] = useState(false);
  const fileRef = useRef(null);

  const reloadCenters = useCallback(async () => {
    try {
      const all = await authFetchAllPages("/api/admin/centers/?page_size=100");
      setCenters(all);
    } catch {
      setCenters([]);
    }
  }, []);
  const reloadSpaces = useCallback(async () => {
    const d = await authFetch(spacesAdminListPath(page, debouncedFilterQ, filterSpaceStatus));
    const { results, count } = parsePaginatedResponse(d);
    setRows(results);
    setTotalCount(count);
  }, [page, debouncedFilterQ, filterSpaceStatus]);

  useEffect(() => {
    if (!authReady || !accessToken) return;
    let cancelled = false;
    (async () => {
      try {
        await reloadCenters();
        await reloadSpaces();
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Error al cargar");
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, accessToken, reloadCenters, reloadSpaces]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilterQ, filterSpaceStatus]);

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
    setShoppingCenter("");
    setCode("");
    setType("billboard");
    setTitle("");
    setDescription("");
    setMonthlyPrice("");
    setStatus("available");
    setWidth("");
    setHeight("");
    setQuantity("1");
    setMaterial("");
    setLocationDescription("");
    setLevel("");
    setVenueZone("");
    setDoubleSided(false);
    setProductionSpecs("");
    setInstallationNotes("");
    setHemPocketTopCm("");
    setCoverFile(null);
    setPendingClearCover(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function openCreate() {
    setSelected(null);
    resetForm();
    setModal("create");
  }

  function openView(s) {
    setSelected(s);
    setModal("view");
  }

  function openEdit(s) {
    if (!s) return;
    setSelected(s);
    setShoppingCenter(String(s.shopping_center));
    setCode(s.code);
    setType(s.type);
    setTitle(s.title);
    setDescription(s.description || "");
    setMonthlyPrice(String(s.monthly_price_usd));
    setStatus(s.status);
    setWidth(s.width != null ? String(s.width) : "");
    setHeight(s.height != null ? String(s.height) : "");
    setQuantity(s.quantity != null ? String(s.quantity) : "1");
    setMaterial(s.material || "");
    setLocationDescription(s.location_description || "");
    setLevel(s.level || "");
    setVenueZone(s.venue_zone || "");
    setDoubleSided(Boolean(s.double_sided));
    setProductionSpecs(s.production_specs || "");
    setInstallationNotes(s.installation_notes || "");
    setHemPocketTopCm(s.hem_pocket_top_cm != null ? String(s.hem_pocket_top_cm) : "");
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

  function valuesObject() {
    const centerId = parseInt(shoppingCenter, 10);
    return {
      code,
      shopping_center: centerId,
      type,
      title,
      description,
      monthly_price_usd: monthlyPrice,
      status,
      width,
      height,
      quantity,
      material,
      location_description: locationDescription,
      level,
      venue_zone: venueZone,
      double_sided: doubleSided,
      production_specs: productionSpecs,
      installation_notes: installationNotes,
      hem_pocket_top_cm: hemPocketTopCm,
    };
  }

  function jsonSpaceBody(v, mode) {
    const centerId = parseInt(String(v.shopping_center), 10);
    const out = {
      shopping_center: centerId,
      type: v.type,
      title: v.title.trim(),
      description: v.description.trim(),
      monthly_price_usd: v.monthly_price_usd.trim(),
      status: v.status,
      double_sided: v.double_sided,
    };
    if (mode === "create") out.code = v.code.trim();
    if (v.width.trim()) out.width = v.width.trim();
    if (v.height.trim()) out.height = v.height.trim();
    if (v.quantity.trim()) out.quantity = parseInt(v.quantity, 10);
    if (v.material.trim()) out.material = v.material.trim();
    if (v.location_description.trim()) out.location_description = v.location_description.trim();
    if (v.level.trim()) out.level = v.level.trim();
    if (v.venue_zone.trim()) out.venue_zone = v.venue_zone.trim();
    if (v.production_specs.trim()) out.production_specs = v.production_specs.trim();
    if (v.installation_notes.trim()) out.installation_notes = v.installation_notes.trim();
    if (v.hem_pocket_top_cm.trim()) out.hem_pocket_top_cm = v.hem_pocket_top_cm.trim();
    return out;
  }

  async function submitSave() {
    setErr("");
    setMsg("");
    const centerId = parseInt(shoppingCenter, 10);
    if (!centerId) {
      setErr("Selecciona un centro.");
      return;
    }
    try {
      const v = valuesObject();
      if (modal === "create") {
        if (coverFile) {
          const fd = new FormData();
          buildSpacePayload(fd, v);
          fd.append("cover_image", coverFile);
          await authFetchForm("/api/admin/spaces/", { method: "POST", formData: fd });
        } else {
          await authFetch("/api/admin/spaces/", { method: "POST", body: jsonSpaceBody(v, "create") });
        }
        setMsg("Toma creada.");
      } else if (modal === "edit" && selected) {
        if (coverFile) {
          const fd = new FormData();
          buildSpacePayload(fd, v);
          fd.append("cover_image", coverFile);
          await authFetchForm(`/api/admin/spaces/${selected.id}/`, { method: "PATCH", formData: fd });
        } else {
          const body = jsonSpaceBody(v, "edit");
          if (pendingClearCover) body.cover_image = null;
          await authFetch(`/api/admin/spaces/${selected.id}/`, { method: "PATCH", body });
        }
        setMsg("Toma actualizada.");
      }
      closeModal();
      await reloadSpaces();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  function askDeleteSpace(id) {
    setDeleteTargetId(id);
  }

  async function executeDeleteSpace(id) {
    setErr("");
    try {
      await authFetch(`/api/admin/spaces/${id}/`, { method: "DELETE" });
      setMsg("Toma eliminada.");
      await reloadSpaces();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
      throw e;
    }
  }

  const readOnly = modal === "view";
  const existingCover = selected?.cover_image && !pendingClearCover ? selected.cover_image : null;

  useEffect(() => {
    setExpandedId(null);
  }, [filterQ, filterSpaceStatus, page]);

  if (!ready) {
    return <TomasAdminSectionSkeleton />;
  }

  return (
    <div className={adminPanelCard}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={adminSectionHeaderIconWrap}>
            <IconAdminGrid className="!h-8 !w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tomas</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {totalCount} toma{totalCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <button type="button" className={adminPrimaryBtn} onClick={openCreate}>
          <AdminCreatePlusIcon />
          <span className={adminCreateBtnLabel}>Nueva toma</span>
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
            icon={<EmptyStateIconGrid />}
            title="No hay tomas en el catálogo"
            description="Aún no hay espacios publicitarios cargados. Puedes crear el primero con «Nueva toma»."
          />
        </div>
      ) : (
        <>
          <AdminFiltersRow>
            <AdminFilterSearchInput
              id="tomas-filter-q"
              value={filterQ}
              onChange={setFilterQ}
              placeholder="Código, título, centro…"
            />
            <AdminFilterSelect
              id="tomas-filter-status"
              label="Estado de la toma"
              value={filterSpaceStatus}
              onChange={setFilterSpaceStatus}
              options={SPACE_STATUS_FILTERS}
            />
            <AdminFilterClearButton
              show={filtersActive}
              onClick={() => {
                setFilterQ("");
                setFilterSpaceStatus("all");
                setPage(1);
              }}
            />
          </AdminFiltersRow>

          {rows.length === 0 && filtersActive ? (
            <div className="mt-6 rounded-[15px] border border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-600">
              <p>Ninguna toma coincide con los filtros.</p>
              <div className="mt-5 flex justify-center">
                <FilterClearAction
                  onClick={() => {
                    setFilterQ("");
                    setFilterSpaceStatus("all");
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
                    Portada
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Código
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Título
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Centro
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
                {rows.map((s) => {
                const open = expandedId === s.id;
                const panelId = `toma-extra-${s.id}`;
                return (
                  <Fragment key={s.id}>
                    <tr className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/70">
                      <td className="px-2 py-2.5">
                        <AdminAccordionToggle
                          expanded={open}
                          onToggle={() => setExpandedId(open ? null : s.id)}
                          rowId={s.id}
                          controlsId={panelId}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div className="size-11 shrink-0 overflow-hidden rounded-[10px] border border-zinc-100 bg-zinc-100">
                          {s.cover_image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={mediaAbsoluteUrl(s.cover_image)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-zinc-800">{s.code}</td>
                      <td className="max-w-[10rem] truncate px-3 py-2.5 font-medium text-zinc-900" title={s.title}>
                        {s.title}
                      </td>
                      <td className="max-w-[8rem] truncate px-3 py-2.5 text-xs text-zinc-600" title={s.shopping_center_name || undefined}>
                        {s.shopping_center_name || "—"}
                      </td>
                      <td className="px-3 py-2.5 capitalize text-zinc-700">{s.status}</td>
                      <td className="px-3 py-2">
                        <AdminRowActions
                          onView={() => openView(s)}
                          onEdit={() => openEdit(s)}
                          onDelete={() => askDeleteSpace(s.id)}
                        />
                      </td>
                    </tr>
                    {open ? (
                      <AdminAccordionRowPanel colSpan={7} panelId={panelId}>
                        <AdminAccordionDetailHeader
                          badgeText={s.code || "—"}
                          titleLabel="Toma en catálogo"
                          titleLine={
                            <p className="truncate text-sm font-medium text-zinc-900">
                              <span className="font-mono text-zinc-600">{s.code}</span>
                              <span className="mx-2 text-zinc-300" aria-hidden>
                                ·
                              </span>
                              {s.title}
                            </p>
                          }
                          hint="Vista ampliada sin editar"
                        />

                        <div className="mt-5 space-y-6">
                          <AdminDetailSection panelId={panelId} sectionId="gen" title="Datos generales">
                            <AdminDetailInset>
                              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <AdminDetailField label="Centro comercial">
                                  {s.shopping_center_name ? (
                                    <>
                                      <span className="font-medium text-zinc-900">{s.shopping_center_name}</span>
                                      {s.shopping_center_city ? (
                                        <span className="mt-0.5 block text-xs text-zinc-500">
                                          {s.shopping_center_city}
                                        </span>
                                      ) : null}
                                    </>
                                  ) : (
                                    adminDetailEmpty("")
                                  )}
                                </AdminDetailField>
                                <AdminDetailField label="Tipo">{spaceTypeLabel(s.type)}</AdminDetailField>
                                <AdminDetailField label="Estado">
                                  <span className="capitalize">{s.status}</span>
                                </AdminDetailField>
                                <AdminDetailField label="Precio USD / mes">
                                  <span className="tabular-nums">{s.monthly_price_usd}</span>
                                </AdminDetailField>
                                <AdminDetailField label="Cantidad">
                                  {s.quantity != null ? s.quantity : adminDetailEmpty("")}
                                </AdminDetailField>
                                <AdminDetailField label="Medidas">
                                  {s.width != null || s.height != null
                                    ? `${s.width ?? "—"} × ${s.height ?? "—"}`
                                    : adminDetailEmpty("")}
                                </AdminDetailField>
                                <AdminDetailField label="Material">{adminDetailEmpty(s.material)}</AdminDetailField>
                                <AdminDetailField label="Nivel">{adminDetailEmpty(s.level)}</AdminDetailField>
                                <AdminDetailField label="Zona / plaza">{adminDetailEmpty(s.venue_zone)}</AdminDetailField>
                                <AdminDetailField label="Doble cara">{s.double_sided ? "Sí" : "No"}</AdminDetailField>
                                <AdminDetailField label="Bolsillo (cm)">
                                  {s.hem_pocket_top_cm != null
                                    ? s.hem_pocket_top_cm
                                    : adminDetailEmpty("")}
                                </AdminDetailField>
                                <div className="sm:col-span-2 lg:col-span-3">
                                  <AdminDetailField label="Ubicación en centro">
                                    {adminDetailEmpty(s.location_description)}
                                  </AdminDetailField>
                                </div>
                              </div>
                            </AdminDetailInset>
                          </AdminDetailSection>

                          <AdminDetailSection panelId={panelId} sectionId="desc" title="Descripción">
                            <AdminDetailProse text={s.description} emptyHint="Sin descripción." />
                          </AdminDetailSection>

                          <AdminDetailSection panelId={panelId} sectionId="prod" title="Especificaciones artes / producción">
                            <AdminDetailProse text={s.production_specs} emptyHint="Sin especificaciones." />
                          </AdminDetailSection>

                          <AdminDetailSection panelId={panelId} sectionId="inst" title="Notas de montaje">
                            <AdminDetailProse text={s.installation_notes} emptyHint="Sin notas de montaje." />
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
          modal === "create" ? "Nueva toma" : modal === "edit" ? "Editar toma" : "Detalle de la toma"
        }
        subtitle={modal === "view" ? `${selected?.code} · ${selected?.title}` : undefined}
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
              <CoverImageField readOnly variant="cover" existingUrl={selected.cover_image} />
            </div>
            <div>
              <p className={adminLabel}>Código</p>
              <p className="mt-1 font-mono text-sm text-zinc-800">{selected.code}</p>
            </div>
            <div>
              <p className={adminLabel}>Centro comercial</p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {selected.shopping_center_name || "—"}
              </p>
              {selected.shopping_center_city ? (
                <p className="mt-0.5 text-xs text-zinc-500">{selected.shopping_center_city}</p>
              ) : null}
            </div>
            <div>
              <p className={adminLabel}>Tipo</p>
              <p className="mt-1 text-sm text-zinc-800">{spaceTypeLabel(selected.type)}</p>
            </div>
            <div>
              <p className={adminLabel}>Estado</p>
              <p className="mt-1 text-sm capitalize text-zinc-800">{selected.status}</p>
            </div>
            <div className="sm:col-span-2">
              <p className={adminLabel}>Título</p>
              <p className="mt-1 font-medium text-zinc-900">{selected.title}</p>
            </div>
            <div className="sm:col-span-2">
              <p className={adminLabel}>Descripción</p>
              <p className="mt-1 text-sm text-zinc-700">{selected.description || "—"}</p>
            </div>
            <div>
              <p className={adminLabel}>Precio USD / mes</p>
              <p className="mt-1 text-sm tabular-nums text-zinc-800">{selected.monthly_price_usd}</p>
            </div>
            <div>
              <p className={adminLabel}>Zona / plaza (catálogo)</p>
              <p className="mt-1 text-sm text-zinc-800">{selected.venue_zone?.trim() || "—"}</p>
            </div>
            <div>
              <p className={adminLabel}>Doble cara</p>
              <p className="mt-1 text-sm text-zinc-800">{selected.double_sided ? "Sí" : "No"}</p>
            </div>
            <div>
              <p className={adminLabel}>Bolsillo superior (cm)</p>
              <p className="mt-1 text-sm text-zinc-800">{selected.hem_pocket_top_cm ?? "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className={adminLabel}>Especificaciones para artes / producción</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
                {selected.production_specs?.trim() || "—"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className={adminLabel}>Notas de montaje / instalación</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
                {selected.installation_notes?.trim() || "—"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CoverImageField
                readOnly={false}
                variant="cover"
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
              <label className={adminLabel} htmlFor="s-center">
                Centro
              </label>
              <AdminSelect
                id="s-center"
                options={centers.map((c) => ({ v: c.id, l: `${c.code} — ${c.name}` }))}
                value={shoppingCenter}
                onChange={(v) => setShoppingCenter(v === "" || v == null ? "" : String(v))}
                placeholder="Selecciona un centro…"
                inModal
                aria-label="Centro comercial"
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="s-code">
                Código toma
              </label>
              <input
                id="s-code"
                className={adminField}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={modal === "edit"}
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="s-type">
                Tipo
              </label>
              <AdminSelect
                id="s-type"
                options={SPACE_TYPES}
                value={type}
                onChange={(v) => setType(v || "billboard")}
                inModal
                aria-label="Tipo de toma"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="s-title">
                Título
              </label>
              <input
                id="s-title"
                className={adminField}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="s-desc">
                Descripción
              </label>
              <textarea
                id="s-desc"
                className={adminField}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="s-price">
                Precio USD / mes
              </label>
              <input
                id="s-price"
                className={adminField}
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="s-status">
                Estado
              </label>
              <AdminSelect
                id="s-status"
                options={SPACE_STATUS}
                value={status}
                onChange={(v) => setStatus(v || "available")}
                inModal
                aria-label="Estado de la toma"
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="s-w">
                Ancho (opc.)
              </label>
              <input id="s-w" className={adminField} value={width} onChange={(e) => setWidth(e.target.value)} />
            </div>
            <div>
              <label className={adminLabel} htmlFor="s-h">
                Alto (opc.)
              </label>
              <input id="s-h" className={adminField} value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div>
              <label className={adminLabel} htmlFor="s-q">
                Cantidad
              </label>
              <input id="s-q" className={adminField} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <label className={adminLabel} htmlFor="s-mat">
                Material
              </label>
              <input id="s-mat" className={adminField} value={material} onChange={(e) => setMaterial(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="s-loc">
                Ubicación
              </label>
              <input
                id="s-loc"
                className={adminField}
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="s-level">
                Nivel
              </label>
              <input id="s-level" className={adminField} value={level} onChange={(e) => setLevel(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="s-zone">
                Zona / plaza (ej. Plaza Jardín, pasillo)
              </label>
              <input
                id="s-zone"
                className={adminField}
                value={venueZone}
                onChange={(e) => setVenueZone(e.target.value)}
                placeholder="Como en el plano comercial"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="s-double"
                type="checkbox"
                className="size-4 rounded border-zinc-300 accent-[var(--mp-primary)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--mp-primary)_30%,transparent)]"
                checked={doubleSided}
                onChange={(e) => setDoubleSided(e.target.checked)}
              />
              <label htmlFor="s-double" className="text-sm font-medium text-zinc-800">
                Elemento doble cara
              </label>
            </div>
            <div>
              <label className={adminLabel} htmlFor="s-hem">
                Bolsillo superior (cm)
              </label>
              <input
                id="s-hem"
                className={adminField}
                value={hemPocketTopCm}
                onChange={(e) => setHemPocketTopCm(e.target.value)}
                placeholder="ej. 4.5"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="s-prod">
                Especificaciones para artes y producción
              </label>
              <textarea
                id="s-prod"
                className={adminField}
                rows={3}
                value={productionSpecs}
                onChange={(e) => setProductionSpecs(e.target.value)}
                placeholder="Material, medidas máximas, forma alusiva a campaña…"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="s-inst">
                Notas de montaje / instalación
              </label>
              <textarea
                id="s-inst"
                className={adminField}
                rows={3}
                value={installationNotes}
                onChange={(e) => setInstallationNotes(e.target.value)}
                placeholder="Bolsillo solo arriba, prohibición pendón corrido, etc."
              />
            </div>
          </div>
        )}
      </AdminModal>

      <AdminConfirmDialog
        open={deleteTargetId != null}
        onClose={() => setDeleteTargetId(null)}
        title="Eliminar toma"
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (deleteTargetId == null) return;
          await executeDeleteSpace(deleteTargetId);
        }}
      >
        <p>¿Eliminar esta toma?</p>
      </AdminConfirmDialog>
    </div>
  );
}

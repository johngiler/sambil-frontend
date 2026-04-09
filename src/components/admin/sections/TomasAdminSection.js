"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

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
import {
  SPACE_STATUS,
  SPACE_TYPES,
  spaceStatusLabel,
  spaceStatusPillClassName,
} from "@/components/admin/adminConstants";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminAdSpaceGalleryField } from "@/components/admin/AdminAdSpaceGalleryField";
import { IconAdminGrid } from "@/components/admin/adminIcons";
import { TomasAdminSectionSkeleton } from "@/components/admin/skeletons/TomasAdminSectionSkeleton";
import { ImageLightbox } from "@/components/media/ImageLightbox";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, EmptyStateIconGrid } from "@/components/ui/EmptyState";
import { spacesAdminListPath } from "@/lib/adminListQuery";
import {
  ADMIN_CENTERS_ALL_SWR_KEY,
  adminCentersAllPagesFetcher,
  authJsonFetcher,
} from "@/lib/swr/fetchers";
import { adminTomaRowLightboxItems } from "@/lib/imageLightboxItems";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import {
  squareAdminTablePortadaFrameClass,
  squareAdminTablePortadaImgClass,
  squareListImagePreviewButtonRingClass,
} from "@/lib/squareImagePreview";
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
import {
  AdminDashboardFilterLink,
  dashboardCentrosSearchHref,
} from "@/lib/adminDashboardLinks";
import { subtitleCityAfterCenterName } from "@/lib/shoppingCenterDisplay";

const SPACE_STATUS_FILTERS = [{ v: "all", l: "Todos los estados" }, ...SPACE_STATUS];

function TomaCentroComercialValue({ s }) {
  const name = (s?.shopping_center_name || "").trim();
  const slug = (s?.shopping_center_slug || "").trim();
  const cityLine = subtitleCityAfterCenterName(name, s?.shopping_center_city);
  if (!name) return adminDetailEmpty("");
  return (
    <>
      <AdminDashboardFilterLink href={dashboardCentrosSearchHref(slug || name)}>
        {name}
      </AdminDashboardFilterLink>
      {cityLine ? <span className="mt-0.5 block text-xs text-zinc-500">{cityLine}</span> : null}
    </>
  );
}

/** Código de toma: prefijo-T{número}[sufijo]; el prefijo no depende del centro. */
function validateTomaCodeFormat(code) {
  const c = String(code || "").trim().toUpperCase();
  if (!c) return "Indica el código de la toma.";
  if (c.length > 32) return "El código no puede superar 32 caracteres.";
  if (!/^[A-Z0-9][A-Z0-9_-]*-T[0-9]+[A-Z]*$/.test(c)) {
    return "Usa un prefijo (letras, números, guiones o guiones bajos), luego «-T», un número y, si aplica, letras (ej. SCC-T1, SLC-T1A).";
  }
  return null;
}

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
  const [expandedId, setExpandedId] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [galleryLightbox, setGalleryLightbox] = useState({
    open: false,
    items: [],
    initialIndex: 0,
  });
  const [filterQ, setFilterQ] = useState("");
  const [filterSpaceStatus, setFilterSpaceStatus] = useState("all");
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

  const galleryRef = useRef(null);

  const centersAllKey = authReady && accessToken ? ADMIN_CENTERS_ALL_SWR_KEY : null;
  const {
    data: centersData,
    error: centersSwrError,
    isLoading: centersLoading,
    mutate: mutateCentersAll,
  } = useSWR(centersAllKey, adminCentersAllPagesFetcher);

  const spacesListKey =
    authReady && accessToken ? spacesAdminListPath(page, debouncedFilterQ, filterSpaceStatus) : null;
  const {
    data: spacesData,
    error: spacesSwrError,
    isLoading: spacesLoading,
    mutate: mutateSpaces,
  } = useSWR(spacesListKey, authJsonFetcher, { keepPreviousData: true });

  const centers = useMemo(
    () => (Array.isArray(centersData) ? centersData : []),
    [centersData],
  );
  const rows = useMemo(
    () => (spacesData ? parsePaginatedResponse(spacesData).results : []),
    [spacesData],
  );
  const totalCount = useMemo(
    () => (spacesData ? parsePaginatedResponse(spacesData).count : 0),
    [spacesData],
  );

  const reloadSpaces = useCallback(() => mutateSpaces(), [mutateSpaces]);

  const ready =
    !(authReady && accessToken) ||
    ((!centersLoading && (centersData !== undefined || centersSwrError !== undefined)) &&
      (!spacesLoading && (spacesData !== undefined || spacesSwrError !== undefined)));

  useEffect(() => {
    const ce = centersSwrError
      ? centersSwrError instanceof Error
        ? centersSwrError.message
        : String(centersSwrError)
      : "";
    const sp = spacesSwrError
      ? spacesSwrError instanceof Error
        ? spacesSwrError.message
        : String(spacesSwrError)
      : "";
    setErr(ce || sp);
  }, [centersSwrError, spacesSwrError]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilterQ, filterSpaceStatus]);

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

  async function submitSave() {
    setErr("");
    setMsg("");
    const centerId = parseInt(shoppingCenter, 10);
    if (!centerId) {
      setErr("Selecciona un centro comercial.");
      return;
    }
    if (modal === "create") {
      const codeErr = validateTomaCodeFormat(code);
      if (codeErr) {
        setErr(codeErr);
        return;
      }
    }
    try {
      const v = valuesObject();
      const payload = galleryRef.current?.getPayload?.() ?? { plan: [], newFiles: [] };
      if (modal === "create") {
        const fd = new FormData();
        buildSpacePayload(fd, { ...v, code: v.code.trim().toUpperCase() });
        fd.append("gallery_plan", JSON.stringify(payload.plan));
        payload.newFiles.forEach((f) => fd.append("gallery_add", f));
        await authFetchForm("/api/admin/spaces/", { method: "POST", formData: fd });
        setMsg("Toma creada.");
      } else if (modal === "edit" && selected) {
        const fd = new FormData();
        buildSpacePayload(fd, v);
        fd.append("gallery_plan", JSON.stringify(payload.plan));
        payload.newFiles.forEach((f) => fd.append("gallery_add", f));
        await authFetchForm(`/api/admin/spaces/${selected.id}/`, { method: "PATCH", formData: fd });
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

  function tomaViewGalleryRows(s) {
    if (!s) return [];
    if (Array.isArray(s.gallery_images) && s.gallery_images.length > 0) return s.gallery_images;
    if (s.cover_image) return [{ id: -1, image: s.cover_image, sort_order: 0 }];
    return [];
  }

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
              placeholder="Código, título, centro comercial…"
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
                    Centro comercial
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
                        {(() => {
                          const first =
                            Array.isArray(s.gallery_images) && s.gallery_images.length > 0
                              ? s.gallery_images[0]?.image
                              : s.cover_image;
                          const thumbSrc = first ? mediaAbsoluteUrl(first) : "";
                          const lbItems = adminTomaRowLightboxItems(s, s.title);
                          if (!thumbSrc) {
                            return <div className={squareAdminTablePortadaFrameClass} aria-hidden />;
                          }
                          return (
                            <button
                              type="button"
                              className={`${squareAdminTablePortadaFrameClass} ${squareListImagePreviewButtonRingClass} p-0`}
                              aria-label={
                                s.title
                                  ? `Ver galería: ${s.title}`
                                  : "Ver imágenes de la toma"
                              }
                              onClick={() => {
                                const items =
                                  lbItems.length > 0
                                    ? lbItems
                                    : thumbSrc
                                      ? [{ src: thumbSrc, alt: s.title || "Portada" }]
                                      : [];
                                if (!items.length) return;
                                setGalleryLightbox({
                                  open: true,
                                  items,
                                  initialIndex: 0,
                                });
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={thumbSrc} alt="" className={squareAdminTablePortadaImgClass} />
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-zinc-800">{s.code}</td>
                      <td className="max-w-[10rem] truncate px-3 py-2.5 font-medium text-zinc-900" title={s.title}>
                        {s.title}
                      </td>
                      <td className="max-w-[8rem] truncate px-3 py-2.5 text-xs text-zinc-600">
                        {s.shopping_center_name?.trim() ? (
                          <AdminDashboardFilterLink
                            href={dashboardCentrosSearchHref(
                              s.shopping_center_slug || s.shopping_center_name,
                            )}
                            className="block truncate"
                            title={s.shopping_center_name}
                          >
                            {s.shopping_center_name}
                          </AdminDashboardFilterLink>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${spaceStatusPillClassName(s.status)}`}
                        >
                          {spaceStatusLabel(s.status, s.status_label)}
                        </span>
                      </td>
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
                            <p className="truncate text-sm font-medium text-zinc-900">{s.title}</p>
                          }
                          hint="Vista ampliada sin editar"
                        />

                        <div className="mt-5 space-y-6">
                          <AdminDetailSection panelId={panelId} sectionId="gen" title="Datos generales">
                            <AdminDetailInset>
                              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <AdminDetailField label="Centro comercial">
                                  <TomaCentroComercialValue s={s} />
                                </AdminDetailField>
                                <AdminDetailField label="Tipo">{spaceTypeLabel(s.type)}</AdminDetailField>
                                <AdminDetailField label="Estado">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${spaceStatusPillClassName(s.status)}`}
                                  >
                                    {spaceStatusLabel(s.status, s.status_label)}
                                  </span>
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
              <AdminAdSpaceGalleryField readOnly initialServerImages={tomaViewGalleryRows(selected)} />
            </div>
            <div>
              <p className={adminLabel}>Código</p>
              <p className="mt-1 font-mono text-sm text-zinc-800">{selected.code}</p>
            </div>
            <div>
              <p className={adminLabel}>Centro comercial</p>
              <div className="mt-1 text-sm">
                <TomaCentroComercialValue s={selected} />
              </div>
            </div>
            <div>
              <p className={adminLabel}>Tipo</p>
              <p className="mt-1 text-sm text-zinc-800">{spaceTypeLabel(selected.type)}</p>
            </div>
            <div>
              <p className={adminLabel}>Estado</p>
              <p className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${spaceStatusPillClassName(selected.status)}`}
                >
                  {spaceStatusLabel(selected.status, selected.status_label)}
                </span>
              </p>
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
              <AdminAdSpaceGalleryField
                ref={galleryRef}
                key={modal === "edit" && selected ? `edit-${selected.id}` : "create"}
                readOnly={false}
                initialServerImages={modal === "edit" && selected ? selected.gallery_images || [] : []}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabel} htmlFor="s-center">
                Centro comercial
              </label>
              <AdminSelect
                id="s-center"
                options={centers.map((c) => ({ v: c.id, l: `${c.slug} — ${c.name}` }))}
                value={shoppingCenter}
                onChange={(v) => setShoppingCenter(v === "" || v == null ? "" : String(v))}
                placeholder="Selecciona un centro comercial…"
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
                autoComplete="off"
                spellCheck={false}
              />
              {modal === "create" ? (
                <p className="mt-1 text-xs text-zinc-500">
                  Formato{" "}
                  <span className="font-mono text-zinc-600">
                    {"{prefijo}-T{número}[sufijo]"}
                  </span>
                  . Ejemplos: <span className="font-mono">SCC-T1</span>,{" "}
                  <span className="font-mono">SLC-T1A</span>. El prefijo es el código único de la toma (no tiene
                  que coincidir con el slug del centro).
                </p>
              ) : null}
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

      <ImageLightbox
        open={galleryLightbox.open}
        onClose={() => setGalleryLightbox((st) => ({ ...st, open: false }))}
        items={galleryLightbox.items}
        initialIndex={galleryLightbox.initialIndex}
        showDownload={false}
        showThumbnails={galleryLightbox.items.length > 1}
        ariaLabel="Galería de la toma"
      />

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

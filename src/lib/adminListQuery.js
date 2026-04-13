/** Rutas de listado admin con paginación y filtros (parámetros alineados con el backend). */

export function ordersListPath(page, search, status) {
  const p = new URLSearchParams();
  p.set("page", String(page));
  if (search.trim()) p.set("search", search.trim());
  if (status && status !== "all") p.set("status", status);
  return `/api/orders/?${p.toString()}`;
}

/** Mismos filtros de búsqueda y estado que el listado; sin paginación (todos los resultados). */
export function ordersExportReportPath(search, status) {
  const p = new URLSearchParams();
  if (search.trim()) p.set("search", search.trim());
  if (status && status !== "all") p.set("status", status);
  const q = p.toString();
  return q ? `/api/orders/export-report/?${q}` : "/api/orders/export-report/";
}

export function clientsListPath(page, search, status) {
  const p = new URLSearchParams();
  p.set("page", String(page));
  if (search.trim()) p.set("search", search.trim());
  if (status && status !== "all") p.set("status", status);
  return `/api/clients/?${p.toString()}`;
}

export function usersAdminListPath(page, search, role) {
  const p = new URLSearchParams();
  p.set("page", String(page));
  if (search.trim()) p.set("search", search.trim());
  if (role && role !== "all") p.set("role", role);
  return `/api/admin/users/?${p.toString()}`;
}

export function centersAdminListPath(page, search, active) {
  const p = new URLSearchParams();
  p.set("page", String(page));
  if (search.trim()) p.set("search", search.trim());
  if (active && active !== "all") p.set("active", active);
  return `/api/admin/centers/?${p.toString()}`;
}

export function spacesAdminListPath(page, search, status) {
  const p = new URLSearchParams();
  p.set("page", String(page));
  if (search.trim()) p.set("search", search.trim());
  if (status && status !== "all") p.set("status", status);
  return `/api/admin/spaces/?${p.toString()}`;
}

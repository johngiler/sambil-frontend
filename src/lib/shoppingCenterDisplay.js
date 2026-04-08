/** Ciudad a mostrar tras el nombre del CC, sin duplicar si el nombre ya la incluye. */
export function subtitleCityAfterCenterName(centerName, centerCity) {
  const name = (centerName || "").trim();
  const c = (centerCity || "").trim();
  if (!c) return null;
  const nl = name.toLowerCase();
  const cl = c.toLowerCase();
  if (nl === cl) return null;
  if (nl.endsWith(cl)) return null;
  if (nl.includes(`· ${c}`) || nl.includes(`·${c}`)) return null;
  if (nl.includes(cl)) return null;
  return c;
}

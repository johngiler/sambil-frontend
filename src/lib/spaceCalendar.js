/** Utilidades para calendario anual de tomas (12 meses, año de disponibilidad del API). */

/** @param {unknown} raw */
export function normalizeMonthsOccupied(raw) {
  if (!Array.isArray(raw) || raw.length !== 12) {
    return Array(12).fill(false);
  }
  return raw.map((x) => Boolean(x));
}

/** @param {boolean[]} occupied */
export function availableMonthsCount(occupied) {
  return occupied.filter((o) => !o).length;
}

/**
 * @param {number} year
 * @param {number} startMonth 1–12
 * @param {number} endMonth 1–12
 * @param {boolean[]} occupied
 */
export function rangeTouchesOccupiedMonth(year, startMonth, endMonth, occupied) {
  for (let m = startMonth; m <= endMonth; m += 1) {
    if (occupied[m - 1]) return true;
  }
  return false;
}

/**
 * @param {number} year
 * @param {number} startMonth 1–12
 * @param {number} endMonth 1–12
 */
export function monthRangeToIsoDates(year, startMonth, endMonth) {
  const lastDay = new Date(year, endMonth, 0).getDate();
  const sm = String(startMonth).padStart(2, "0");
  const em = String(endMonth).padStart(2, "0");
  const ld = String(lastDay).padStart(2, "0");
  return {
    start_date: `${year}-${sm}-01`,
    end_date: `${year}-${em}-${ld}`,
  };
}

export const MONTH_SHORT_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

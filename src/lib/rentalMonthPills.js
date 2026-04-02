import { parseISODateOnly } from "@/lib/rentalDates";
import { MONTH_SHORT_ES } from "@/lib/spaceCalendar";

/**
 * Etiquetas cortas de meses de calendario cubiertos por [start, end] (inclusive).
 * @param {string} startStr
 * @param {string} endStr
 * @returns {string[]}
 */
export function contractMonthShortLabels(startStr, endStr) {
  if (!startStr || !endStr) return [];
  const s = parseISODateOnly(startStr);
  const e = parseISODateOnly(endStr);
  if (e < s) return [];
  const out = [];
  const cur = new Date(s.getFullYear(), s.getMonth(), 1);
  const endM = new Date(e.getFullYear(), e.getMonth(), 1);
  while (cur <= endM) {
    const label = MONTH_SHORT_ES[cur.getMonth()];
    if (!out.length || out[out.length - 1] !== label) out.push(label);
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
}

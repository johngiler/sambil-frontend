/** Temporada alta por centro (alineado con backend/apps/malls/utils/high_season.py). */

import { contractMonthsInclusive, parseISODateOnly } from "@/lib/rentalDates";

/** @param {unknown} raw */
export function normalizeHighSeasonMonths(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const x of raw) {
    const m = Number(x);
    if (Number.isInteger(m) && m >= 1 && m <= 12 && !out.includes(m)) out.push(m);
  }
  return out.sort((a, b) => a - b);
}

/** @param {unknown} raw */
export function parseHighSeasonMultiplier(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(10, Math.round(n * 100) / 100);
}

/**
 * @param {number} baseMonthly
 * @param {number[]} highSeasonMonths
 * @param {number} multiplier
 * @param {number} month1to12
 */
export function effectiveMonthlyForMonth(baseMonthly, highSeasonMonths, multiplier, month1to12) {
  const base = Number(baseMonthly);
  if (!Number.isFinite(base)) return 0;
  if (highSeasonMonths.includes(month1to12)) {
    return Math.round(base * multiplier * 100) / 100;
  }
  return base;
}

/**
 * @param {string} startStr
 * @param {string} endStr
 */
function* iterMonthsInIsoRange(startStr, endStr) {
  let d = parseISODateOnly(startStr);
  const end = parseISODateOnly(endStr);
  while (d <= end) {
    yield { year: d.getFullYear(), month: d.getMonth() + 1 };
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
}

/**
 * @param {number | string} monthlyUsd
 * @param {string} startStr
 * @param {string} endStr
 * @param {number[]} [highSeasonMonths]
 * @param {number} [multiplier]
 */
export function lineSubtotalWithHighSeason(
  monthlyUsd,
  startStr,
  endStr,
  highSeasonMonths = [],
  multiplier = 1,
) {
  if (!startStr || !endStr) return 0;
  const months = normalizeHighSeasonMonths(highSeasonMonths);
  const mult = parseHighSeasonMultiplier(multiplier);
  if (months.length === 0 || mult <= 1) {
    const n = Number(monthlyUsd);
    const span = contractMonthsInclusive(startStr, endStr);
    if (!Number.isFinite(n) || span <= 0) return 0;
    return Math.round(n * span * 100) / 100;
  }
  let total = 0;
  for (const { month } of iterMonthsInIsoRange(startStr, endStr)) {
    total += effectiveMonthlyForMonth(monthlyUsd, months, mult, month);
  }
  return Math.round(total * 100) / 100;
}

/**
 * @param {Record<string, unknown> | null | undefined} spaceOrItem
 */
export function highSeasonFromSpace(spaceOrItem) {
  if (!spaceOrItem || typeof spaceOrItem !== "object") {
    return { months: [], multiplier: 1 };
  }
  return {
    months: normalizeHighSeasonMonths(spaceOrItem.high_season_months),
    multiplier: parseHighSeasonMultiplier(spaceOrItem.high_season_multiplier),
  };
}

/**
 * @param {string} startStr
 * @param {string} endStr
 * @param {number[]} highSeasonMonths
 */
export function highSeasonMonthsTouchedInRange(startStr, endStr, highSeasonMonths) {
  const hs = normalizeHighSeasonMonths(highSeasonMonths);
  if (!hs.length || !startStr || !endStr) return [];
  const touched = new Set();
  for (const { month } of iterMonthsInIsoRange(startStr, endStr)) {
    if (hs.includes(month)) touched.add(month);
  }
  return [...touched].sort((a, b) => a - b);
}

export const MONTH_LABELS_ES = [
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

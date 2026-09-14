// Pure experience helpers and types: no Prisma, safe to import from client
// components. Queries live in src/models/experience.ts.

export const METRIC_TYPES = ["default", "green", "amber"] as const;
export type MetricType = (typeof METRIC_TYPES)[number];

// `type`, not `interface`: Prisma's JSON input type needs the implicit index
// signature that only type aliases get.
export type ExperienceMetric = {
  label: string;
  type?: MetricType;
};

export type ExperienceProject = {
  name: string;
  icon: string;
  tags: string[];
};

// Only the fields the date helpers need, so they work on DB rows and form data alike.
export interface ExperiencePeriod {
  startDate: Date;
  endDate: Date | null;
  periodLabel?: string | null;
  // Only an explicit false excludes the entry from the years sum.
  countsTowardExperience?: boolean;
}

// Serializable view of one entry, as the Timeline section renders it.
export interface TimelineEntry {
  id: string;
  role: string;
  company: string;
  companyLink: string | null;
  period: string;
  yearRange: string;
  description: string;
  metrics: ExperienceMetric[];
  projects: ExperienceProject[];
}

// <input type="month"> values ("2022-11") ↔ the first of that month, 00:00 UTC.
export function toMonthValue(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function fromMonthValue(value: string): Date {
  const [year, month] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

// Dates are stored as the first of the month at 00:00 UTC, so always format in UTC.
const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

// "Nov 2022 — Present", or the label when one is set ("Early Career").
export function formatPeriod(e: ExperiencePeriod): string {
  if (e.periodLabel) return e.periodLabel;
  return `${monthYear.format(e.startDate)} — ${e.endDate ? monthYear.format(e.endDate) : "Present"}`;
}

// "2022 — Present" for the timeline's Jump-to list; a single year when it starts and ends in one.
export function formatYearRange(e: ExperiencePeriod): string {
  if (e.periodLabel) return e.periodLabel;
  const start = e.startDate.getUTCFullYear();
  if (!e.endDate) return `${start} — Present`;
  const end = e.endDate.getUTCFullYear();
  return start === end ? String(start) : `${start} — ${end}`;
}

const addMonths = (d: Date, n: number) =>
  Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, d.getUTCDate());

// Calendar months from a to b, with the last partial month as a fraction.
// Counting in months rather than dividing milliseconds by an average year keeps
// exact calendar spans exact: Jan 2015 → Dec 2019 is 60 months, i.e. 5 years,
// where 1826 days / 365.2425 would floor to 4.
function monthsBetween(a: number, b: number): number {
  const start = new Date(a);
  const end = new Date(b);
  let months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth();
  if (addMonths(start, months) > b) months--;
  const anchor = addMonths(start, months);
  return months + (b - anchor) / (addMonths(start, months + 1) - anchor);
}

// Whole years worked. Each entry covers its start month through the end of its
// end month (a Present entry runs to `now`). Overlapping or touching entries are
// merged first, so a promotion month counts once, and gaps between merged spans
// (career breaks) are never counted. Entries with countsTowardExperience: false
// (e.g. Early Career) are left out entirely.
export function calculateYearsOfExperience(entries: ExperiencePeriod[], now: Date = new Date()): number {
  const spans = entries
    .filter((e) => e.countsTowardExperience !== false)
    .map(({ startDate, endDate }) => {
      const start = startDate.getTime();
      // The whole end month counts: run to the first day of the following month.
      const end = endDate
        ? Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, 1)
        : now.getTime();
      return [start, Math.min(end, now.getTime())] as const;
    })
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);

  let months = 0;
  let current: [number, number] | null = null;
  for (const [start, end] of spans) {
    if (current && start <= current[1]) {
      current[1] = Math.max(current[1], end);
    } else {
      if (current) months += monthsBetween(current[0], current[1]);
      current = [start, end];
    }
  }
  if (current) months += monthsBetween(current[0], current[1]);

  return Math.floor(months / 12);
}

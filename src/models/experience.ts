// Experience model: every query against the Experience table goes through here.
// `metrics` and `projects` are JSON columns; rows are returned with them typed.
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Experience as ExperienceRow } from "@/generated/prisma/client";
import {
  calculateYearsOfExperience,
  formatPeriod,
  formatYearRange,
  type ExperienceMetric,
  type ExperienceProject,
  type TimelineEntry,
} from "@/lib/experience";

export type Experience = Omit<ExperienceRow, "metrics" | "projects"> & {
  metrics: ExperienceMetric[];
  projects: ExperienceProject[];
};

export interface ExperienceInput {
  role: string;
  company: string;
  companyLink: string | null;
  // First day of the month; endDate null means Present.
  startDate: Date;
  endDate: Date | null;
  periodLabel: string | null;
  countsTowardExperience: boolean;
  description: string;
  metrics: ExperienceMetric[];
  projects: ExperienceProject[];
}

// The JSON columns are only ever written through ExperienceInput (validated
// before it gets here), so the stored shape is trusted on the way out.
function withTypedJson(row: ExperienceRow): Experience {
  return {
    ...row,
    metrics: Array.isArray(row.metrics) ? (row.metrics as unknown as ExperienceMetric[]) : [],
    projects: Array.isArray(row.projects) ? (row.projects as unknown as ExperienceProject[]) : [],
  };
}

// Newest first, the order the timeline shows.
export async function listExperiences(): Promise<Experience[]> {
  const rows = await prisma.experience.findMany({ orderBy: [{ startDate: "desc" }, { createdAt: "desc" }] });
  return rows.map(withTypedJson);
}

// Everything the home page needs, computed once per request (page and
// generateMetadata share it through React cache). Plain strings only, so it can
// be passed straight to client components.
export const getTimeline = cache(async (): Promise<{ entries: TimelineEntry[]; yearsOfExperience: number }> => {
  const experiences = await listExperiences();
  return {
    yearsOfExperience: calculateYearsOfExperience(experiences),
    entries: experiences.map((e) => ({
      id: e.id,
      role: e.role,
      company: e.company,
      companyLink: e.companyLink,
      period: formatPeriod(e),
      yearRange: formatYearRange(e),
      description: e.description,
      metrics: e.metrics,
      projects: e.projects,
    })),
  };
});

export async function findExperience(id: string): Promise<Experience | null> {
  const row = await prisma.experience.findUnique({ where: { id } });
  return row && withTypedJson(row);
}

export function countExperiences() {
  return prisma.experience.count();
}

export function createExperience(data: ExperienceInput) {
  return prisma.experience.create({ data });
}

export function updateExperience(id: string, data: ExperienceInput) {
  return prisma.experience.update({ where: { id }, data });
}

export function deleteExperience(id: string) {
  return prisma.experience.delete({ where: { id } });
}

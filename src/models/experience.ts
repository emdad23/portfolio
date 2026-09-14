// Experience model: every query against the Experience table goes through here.
// `metrics` and `projects` are JSON columns; rows are returned with them typed.
import { prisma } from "@/lib/prisma";
import type { Experience as ExperienceRow } from "@/generated/prisma/client";

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

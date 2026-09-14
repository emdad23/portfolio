// Skill model: every query against the Skill table goes through here.
import { cache } from "react";
import { prisma } from "@/lib/prisma";

// The home page has two marquee rows.
export const SKILL_ROWS = [1, 2] as const;
export type SkillRow = (typeof SKILL_ROWS)[number];

export interface SkillInput {
  name: string;
  icon: string | null;
  row: SkillRow;
  sortOrder: number;
}

const ordered = [{ row: "asc" }, { sortOrder: "asc" }, { name: "asc" }] as const;

export function listSkills() {
  return prisma.skill.findMany({ orderBy: [...ordered] });
}

export function countSkills() {
  return prisma.skill.count();
}

// Marquee labels per row, e.g. { 1: ["⚡ PHP", …], 2: ["🐋 Kubernetes", …] }.
// Cached per request.
export const getSkillMarqueeRows = cache(async (): Promise<Record<SkillRow, string[]>> => {
  const rows: Record<SkillRow, string[]> = { 1: [], 2: [] };
  for (const skill of await listSkills()) {
    const row = skill.row === 2 ? 2 : 1;
    rows[row].push(skill.icon ? `${skill.icon} ${skill.name}` : skill.name);
  }
  return rows;
});

export function createSkill(data: SkillInput) {
  return prisma.skill.create({ data });
}

export function updateSkill(id: string, data: SkillInput) {
  return prisma.skill.update({ where: { id }, data });
}

export function deleteSkill(id: string) {
  return prisma.skill.delete({ where: { id } });
}

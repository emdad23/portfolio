import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { listSkills } from "@/models/skill";
import { SkillsManager, type AdminSkill } from "./SkillsManager";

export const metadata: Metadata = { title: "Skills · Admin" };

export default async function AdminSkillsPage() {
  await requireAdmin();
  const skills: AdminSkill[] = (await listSkills()).map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    row: s.row === 2 ? 2 : 1,
    sortOrder: s.sortOrder,
  }));

  return (
    <>
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.03em] leading-[1.1] text-black mb-2">Skills</h1>
      <p className="text-[0.95rem] text-text2 max-w-[65ch] mb-8">
        The two scrolling rows in the Stack section of the home page. Within a row, skills run from the lowest sort order up.
      </p>
      <SkillsManager skills={skills} />
    </>
  );
}

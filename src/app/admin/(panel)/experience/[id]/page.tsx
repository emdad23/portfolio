import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminHref, requireAdmin } from "@/lib/auth/admin";
import { toMonthValue } from "@/lib/experience";
import { findExperience } from "@/models/experience";
import { ExperienceForm } from "../ExperienceForm";

export const metadata: Metadata = { title: "Edit experience · Admin" };

export default async function EditExperiencePage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const experience = await findExperience(params.id);
  if (!experience) notFound();
  const listHref = adminHref("/experience");

  return (
    <>
      <Link href={listHref} className="inline-flex items-center min-h-11 text-[0.83rem] font-semibold text-muted hover:text-black no-underline cursor-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
        ← All experience
      </Link>
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.03em] leading-[1.1] text-black mt-2 mb-8 break-words">
        Edit: {experience.role}
      </h1>
      <ExperienceForm
        cancelHref={listHref}
        values={{
          id: experience.id,
          role: experience.role,
          company: experience.company,
          companyLink: experience.companyLink ?? "",
          startMonth: toMonthValue(experience.startDate),
          endMonth: experience.endDate ? toMonthValue(experience.endDate) : "",
          present: experience.endDate === null,
          periodLabel: experience.periodLabel ?? "",
          countsTowardExperience: experience.countsTowardExperience,
          description: experience.description,
          metrics: experience.metrics.map((m) => ({ label: m.label, type: m.type ?? "default" })),
          projects: experience.projects.map((p) => ({ name: p.name, icon: p.icon, tags: p.tags.join(", ") })),
        }}
      />
    </>
  );
}

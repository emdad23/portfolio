import type { Metadata } from "next";
import Link from "next/link";
import { primaryButtonClass } from "@/components/admin/styles";
import { adminHref, requireAdmin } from "@/lib/auth/admin";
import { calculateYearsOfExperience, formatPeriod } from "@/lib/experience";
import { listExperiences } from "@/models/experience";
import { ExperienceItem, type AdminExperienceRow } from "./ExperienceItem";

export const metadata: Metadata = { title: "Experience · Admin" };

export default async function AdminExperiencePage() {
  await requireAdmin();
  const experiences = await listExperiences();
  const years = calculateYearsOfExperience(experiences);
  const rows: AdminExperienceRow[] = experiences.map((e) => ({
    id: e.id,
    role: e.role,
    company: e.company,
    period: formatPeriod(e),
    countsTowardExperience: e.countsTowardExperience,
    editHref: adminHref(`/experience/${e.id}`),
  }));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.03em] leading-[1.1] text-black mb-2">Experience</h1>
          <p className="text-[0.95rem] text-text2 max-w-[65ch]">
            The career timeline, newest first. These entries add up to <strong className="text-black">{years}+ years</strong> on the site.
          </p>
        </div>
        <Link href={adminHref("/experience/new")} className={primaryButtonClass}>+ New entry</Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-[0.9rem] text-muted border-t border-border py-6">No entries yet. The timeline is empty on the site.</p>
      ) : (
        <ul className="border-t border-border">
          {rows.map((row) => <ExperienceItem key={row.id} entry={row} />)}
        </ul>
      )}
    </>
  );
}

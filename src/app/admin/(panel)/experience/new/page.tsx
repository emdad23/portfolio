import type { Metadata } from "next";
import Link from "next/link";
import { adminHref, requireAdmin } from "@/lib/auth/admin";
import { ExperienceForm } from "../ExperienceForm";

export const metadata: Metadata = { title: "New experience · Admin" };

export default async function NewExperiencePage() {
  await requireAdmin();
  const listHref = adminHref("/experience");

  return (
    <>
      <Link href={listHref} className="inline-flex items-center min-h-11 text-[0.83rem] font-semibold text-muted hover:text-black no-underline cursor-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
        ← All experience
      </Link>
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.03em] leading-[1.1] text-black mt-2 mb-8">New experience</h1>
      <ExperienceForm
        cancelHref={listHref}
        values={{
          role: "",
          company: "",
          companyLink: "",
          startMonth: "",
          endMonth: "",
          present: false,
          periodLabel: "",
          countsTowardExperience: true,
          description: "",
          metrics: [],
          projects: [],
        }}
      />
    </>
  );
}

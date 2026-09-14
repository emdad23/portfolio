import Link from "next/link";
import { adminHref, requireAdmin } from "@/lib/auth/admin";
import { countExperiences, getTimeline } from "@/models/experience";
import { countSkills } from "@/models/skill";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [{ yearsOfExperience }, skillCount, experienceCount] = await Promise.all([
    getTimeline(),
    countSkills(),
    countExperiences(),
  ]);

  const stats = [
    { label: "Years of experience", value: `${yearsOfExperience}+`, note: "Computed from experience dates, breaks excluded" },
    { label: "Skills", value: skillCount, note: "Across both marquee rows", href: adminHref("/skills"), cta: "Manage skills →" },
    { label: "Experience entries", value: experienceCount, note: "On the career timeline" },
  ];

  return (
    <>
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.03em] leading-[1.1] text-black mb-2">Dashboard</h1>
      <p className="text-[0.95rem] text-text2 max-w-[65ch] mb-8">What the public site is showing right now.</p>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 flex flex-col gap-1 min-w-0">
            <dt className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-muted">{stat.label}</dt>
            <dd className="text-[clamp(2rem,4vw,2.75rem)] font-black tracking-[-0.03em] leading-none text-black">{stat.value}</dd>
            <dd className="text-[0.8rem] text-muted">{stat.note}</dd>
            {stat.href && (
              <dd className="mt-2">
                <Link href={stat.href} className="inline-flex items-center min-h-11 text-[0.83rem] font-bold text-black underline underline-offset-4 cursor-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
                  {stat.cta}
                </Link>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </>
  );
}

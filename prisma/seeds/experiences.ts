import type { PrismaClient } from "../../src/generated/prisma/client";

// "2022-11" → 1 Nov 2022, 00:00 UTC. Experience dates are stored as the first of
// the month; the whole end month counts toward years of experience.
const month = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
};

const experiences = [
  {
    role: "Principal Software Developer",
    company: "Reddotdigital IT",
    companyLink: "https://reddotdigitalit.com",
    startDate: month("2022-11"),
    endDate: null,
    description:
      "Lead up to 7 concurrent projects. Own the full delivery lifecycle — requirement gathering to post-launch. Manage client relationships directly, set engineering standards, drive Agile velocity.",
    metrics: [
      { label: "🗂 7 concurrent projects" },
      { label: "👥 15+ engineers" },
      { label: "✓ 94% on-time delivery", type: "green" },
    ],
    projects: [
      { name: "🛒 Robishop", icon: "🛒", tags: ["Magento 2", "Vue.js", "AWS", "Kubernetes"] },
      { name: "📋 ECRM — Robi", icon: "📋", tags: ["Java", "Spring Boot", "Angular", "Oracle"] },
    ],
  },
  {
    role: "Lead Software Engineer",
    company: "Reddotdigital IT",
    companyLink: "https://reddotdigitalit.com",
    startDate: month("2020-08"),
    endDate: month("2022-11"),
    description:
      "Led feature development, requirement analysis, and team mentoring. Began owning stakeholder communications — sharpening leadership and client-management instincts.",
    metrics: [{ label: "📈 Promoted to Principal in 2 years", type: "amber" }],
    projects: [{ name: "⚙️ Workflow BPA", icon: "⚙️", tags: ["ProcessMaker", "BPM"] }],
  },
  {
    role: "Senior Software Engineer",
    company: "Brain Station 23",
    startDate: month("2017-01"),
    endDate: month("2019-11"),
    description:
      "Shipped apps to 1M+ users, led API development, first client-facing work. Learned that engineers who grow people outlast engineers who only grow code.",
    metrics: [{ label: "📱 1M+ users (Pickaboo)", type: "green" }, { label: "🏢 Banglalink" }],
    projects: [
      { name: "📱 Pickaboo", icon: "📱", tags: ["Magento 1", "REST API"] },
      { name: "📡 Banglalink", icon: "📡", tags: ["Laravel", "React.js"] },
      { name: "🖥 IntelliFriend", icon: "🖥", tags: ["Electron.js", "Node.js"] },
    ],
  },
  {
    role: "Software Engineer",
    company: "Brain Station 23",
    startDate: month("2015-01"),
    endDate: month("2016-12"),
    description:
      "CMS platforms for agriculture and healthcare. Built the system-design fundamentals that still shape how I architect software today.",
    metrics: [],
    projects: [
      { name: "🌾 Intelligent Support System", icon: "🌾", tags: ["Laravel", "PostgreSQL", "React.js"] },
    ],
  },
  {
    role: "Junior Software Engineer",
    company: "Brain Station 23",
    startDate: month("2013-05"),
    endDate: month("2014-12"),
    description:
      "First production code. First deadlines. First lessons in writing software other people have to maintain.",
    metrics: [],
    projects: [{ name: "📝 Question Builder — BCPS", icon: "📝", tags: ["CodeIgniter", "MySQL"] }],
  },
  {
    role: "Software Developer",
    company: "Iterato · PinkWhale · Aareas Interactive",
    // PLACEHOLDER dates — the original entry had none. Correct them in the admin:
    // they count toward the years-of-experience total.
    startDate: month("2011-01"),
    endDate: month("2013-04"),
    periodLabel: "Early Career",
    description:
      "Multiple agencies, different domains, tight deadlines. The pressure that builds engineers who can handle anything.",
    metrics: [],
    projects: [],
  },
];

// Experience is owned by the admin once seeded: only fill an empty table, so
// re-running the seed never overwrites edits.
export async function seedExperiences(prisma: PrismaClient) {
  if ((await prisma.experience.count()) > 0) {
    console.log("↷ Experience table not empty, skipped");
    return;
  }
  const { count } = await prisma.experience.createMany({ data: experiences });
  console.log("✅ Seeded", count, "experience entries");
}

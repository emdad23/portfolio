export interface TimelineEntry {
  role: string;
  company: string;
  companyLink?: string;
  period: string;
  description: string;
  metrics?: { label: string; type?: "default" | "green" | "amber" }[];
  projects?: {
    name: string;
    icon: string;
    tags: string[];
  }[];
}

export const timeline: TimelineEntry[] = [
  {
    role: "Principal Software Developer",
    company: "Reddotdigital IT",
    companyLink: "https://reddotdigitalit.com",
    period: "Nov 2022 — Present",
    description:
      "Lead up to 7 concurrent projects. Own the full delivery lifecycle — requirement gathering to post-launch. Manage client relationships directly, set engineering standards, drive Agile velocity.",
    metrics: [
      { label: "🗂 7 concurrent projects" },
      { label: "👥 15+ engineers" },
      { label: "✓ 94% on-time delivery", type: "green" },
    ],
    projects: [
      {
        name: "🛒 Robishop",
        icon: "🛒",
        tags: ["Magento 2", "Vue.js", "AWS", "Kubernetes"],
      },
      {
        name: "📋 ECRM — Robi",
        icon: "📋",
        tags: ["Java", "Spring Boot", "Angular", "Oracle"],
      },
    ],
  },
  {
    role: "Lead Software Engineer",
    company: "Reddotdigital IT",
    companyLink: "https://reddotdigitalit.com",
    period: "Aug 2020 — Nov 2022",
    description:
      "Led feature development, requirement analysis, and team mentoring. Began owning stakeholder communications — sharpening leadership and client-management instincts.",
    metrics: [
      { label: "📈 Promoted to Principal in 2 years", type: "amber" },
    ],
    projects: [
      {
        name: "⚙️ Workflow BPA",
        icon: "⚙️",
        tags: ["ProcessMaker", "BPM"],
      },
    ],
  },
  {
    role: "Senior Software Engineer",
    company: "Brain Station 23",
    period: "Jan 2017 — Nov 2019",
    description:
      "Shipped apps to 1M+ users, led API development, first client-facing work. Learned that engineers who grow people outlast engineers who only grow code.",
    metrics: [
      { label: "📱 1M+ users (Pickaboo)", type: "green" },
      { label: "🏢 Banglalink" },
    ],
    projects: [
      { name: "📱 Pickaboo", icon: "📱", tags: ["Magento 1", "REST API"] },
      { name: "📡 Banglalink", icon: "📡", tags: ["Laravel", "React.js"] },
      {
        name: "🖥 IntelliFriend",
        icon: "🖥",
        tags: ["Electron.js", "Node.js"],
      },
    ],
  },
  {
    role: "Software Engineer",
    company: "Brain Station 23",
    period: "Jan 2015 — Dec 2016",
    description:
      "CMS platforms for agriculture and healthcare. Built the system-design fundamentals that still shape how I architect software today.",
    projects: [
      {
        name: "🌾 Intelligent Support System",
        icon: "🌾",
        tags: ["Laravel", "PostgreSQL", "React.js"],
      },
    ],
  },
  {
    role: "Junior Software Engineer",
    company: "Brain Station 23",
    period: "May 2013 — Dec 2014",
    description:
      "First production code. First deadlines. First lessons in writing software other people have to maintain.",
    projects: [
      {
        name: "📝 Question Builder — BCPS",
        icon: "📝",
        tags: ["CodeIgniter", "MySQL"],
      },
    ],
  },
  {
    role: "Software Developer",
    company: "Iterato · PinkWhale · Aareas Interactive",
    period: "Early Career",
    description:
      "Multiple agencies, different domains, tight deadlines. The pressure that builds engineers who can handle anything.",
  },
];

export const timelineYears = [
  "2022 — Present",
  "2020 — 2022",
  "2017 — 2019",
  "2015 — 2016",
  "2013 — 2014",
  "Early Career",
];

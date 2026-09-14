import type { PrismaClient } from "../../src/generated/prisma/client";

// One array per marquee row; order within a row is the marquee order.
const rows: { icon: string; name: string }[][] = [
  [
    { icon: "⚡", name: "PHP" },
    { icon: "⚛️", name: "React" },
    { icon: "🟢", name: "Vue.js" },
    { icon: "🔷", name: "TypeScript" },
    { icon: "🛒", name: "Magento 2" },
    { icon: "🌿", name: "Laravel" },
    { icon: "🏗", name: "Symfony" },
    { icon: "🟡", name: "JavaScript" },
    { icon: "🍃", name: "MongoDB" },
    { icon: "🐬", name: "MySQL" },
    { icon: "🔮", name: "Next.js" },
    { icon: "⚙️", name: "Node.js" },
    { icon: "☁️", name: "AWS" },
  ],
  [
    { icon: "🐋", name: "Kubernetes" },
    { icon: "🔍", name: "Elasticsearch" },
    { icon: "🖥", name: "Electron.js" },
    { icon: "🅰️", name: "Angular" },
    { icon: "☕", name: "Java" },
    { icon: "🌱", name: "Spring Boot" },
    { icon: "🗄", name: "Oracle" },
    { icon: "🌐", name: "WordPress" },
    { icon: "📚", name: "Moodle" },
    { icon: "🔄", name: "ProcessMaker" },
    { icon: "🐙", name: "Git" },
    { icon: "🏃", name: "Agile/Scrum" },
  ],
];

// Skills are owned by the admin once seeded: only fill an empty table, so
// re-running the seed never overwrites edits.
export async function seedSkills(prisma: PrismaClient) {
  if ((await prisma.skill.count()) > 0) {
    console.log("↷ Skills table not empty, skipped");
    return;
  }
  const { count } = await prisma.skill.createMany({
    data: rows.flatMap((skills, r) => skills.map((s, i) => ({ ...s, row: r + 1, sortOrder: i }))),
  });
  console.log("✅ Seeded", count, "skills");
}

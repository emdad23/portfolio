export interface Pillar {
  num: string;
  icon: string;
  title: string;
  description: string;
}

export const pillars: Pillar[] = [
  {
    num: "01",
    icon: "🧭",
    title: "Team Leadership",
    description: "Led engineers through 7 concurrent high-stakes projects. Maintain velocity, resolve blockers, mentor juniors, build cultures where people do their best work under pressure.",
  },
  {
    num: "02",
    icon: "🤝",
    title: "Client Management",
    description: "Business and engineering in one language. Set honest expectations, communicate progress clearly, handle scope changes calmly. Clients stay in control at every step.",
  },
  {
    num: "03",
    icon: "🏗",
    title: "System Architecture",
    description: "Magento eCommerce to Java CRM and BPM automation. Systems built for real-world scale, maintainable by real teams, deployed to real production environments.",
  },
];

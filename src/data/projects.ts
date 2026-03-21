export interface Project {
  id: string;
  icon: string;
  badge: string;
  title: string;
  description: string;
  metrics: string[];
  tags: string[];
}

export const projects: Project[] = [
  {
    id: "01",
    icon: "🛒",
    badge: "Live · National Scale",
    title: "Robishop",
    description: "B2C eCommerce for Robi Axiata. PWA support, marketplace aggregator integration, scalable cloud infrastructure serving Bangladesh's major telecom customer base.",
    metrics: ["🇧🇩 National scale", "⚡ PWA"],
    tags: ["Magento 2", "Vue.js", "AWS", "Kubernetes", "Elasticsearch"],
  },
  {
    id: "02",
    icon: "📱",
    badge: "1M+ Users",
    title: "Pickaboo",
    description: "High-traffic eCommerce with Android & iOS apps reaching 1M+ users. Led team and owned all API development. Early mobile commerce in Bangladesh — zero downtime rollout.",
    metrics: ["📊 1,000,000+ users", "📱 iOS + Android"],
    tags: ["Magento 1", "REST API", "Team Lead"],
  },
  {
    id: "03",
    icon: "📋",
    badge: "Enterprise CRM",
    title: "ECRM — Robi",
    description: "Enterprise CRM enhancing customer engagement and automating business processes across Robi's operations. Reduced manual errors by 40%+ through integrated workflow automation.",
    metrics: ["🏢 Enterprise scale", "⚙️ Automation"],
    tags: ["Java", "Spring Boot", "Angular", "Oracle"],
  },
  {
    id: "04",
    icon: "🖥",
    badge: "Desktop App",
    title: "IntelliFriend",
    description: "Desktop activity tracking for comparing employee performance and identifying growth areas. Cross-platform, owned full product from architecture to delivery.",
    metrics: ["🖥 Cross-platform", "📊 Real-time"],
    tags: ["Electron.js", "Node.js", "Angular", "MongoDB"],
  },
];

import type { PrismaClient } from "../../src/generated/prisma/client";

const posts = [
  {
    title: "From Junior to Principal: What Nobody Actually Tells You About Growing as an Engineer",
    slug: "junior-to-principal-engineer-growth",
    excerpt: "The uncomfortable truths about career growth in software engineering that most senior engineers keep to themselves.",
    category: "Career",
    readTime: 8,
    content: "# Coming soon\n\nThis post is being written.",
    publishedAt: new Date("2024-01-15"),
  },
  {
    title: "Why Client Communication Is a Technical Skill — And How to Get Good at It",
    slug: "client-communication-technical-skill",
    excerpt: "Engineers who can't communicate with clients plateau at senior level. Here's how I learned to bridge that gap.",
    category: "Client Management",
    readTime: 6,
    content: "# Coming soon\n\nThis post is being written.",
    publishedAt: new Date("2024-02-10"),
  },
  {
    title: "Building Robishop: Lessons from Scaling Magento 2 with Kubernetes on AWS",
    slug: "robishop-magento-kubernetes-aws",
    excerpt: "What I learned running national-scale eCommerce infrastructure for Robi Axiata — the failures, the fixes, and what I'd do differently.",
    category: "Architecture",
    readTime: 10,
    content: "# Coming soon\n\nThis post is being written.",
    publishedAt: new Date("2024-03-05"),
  },
  {
    title: "How I Manage 7 Projects Simultaneously Without Dropping Quality or Burning Out",
    slug: "managing-7-projects-simultaneously",
    excerpt: "The actual systems I use to stay on top of multiple high-stakes projects without sacrificing quality or my own sanity.",
    category: "Team Leadership",
    readTime: 7,
    content: "# Coming soon\n\nThis post is being written.",
    publishedAt: new Date("2024-03-20"),
  },
  {
    title: "The 5 Questions Junior Developers Are Too Afraid to Ask (But Should)",
    slug: "questions-junior-developers-afraid-to-ask",
    excerpt: "After mentoring dozens of junior developers, these are the questions they all have but rarely voice.",
    category: "Mentorship",
    readTime: 5,
    content: "# Coming soon\n\nThis post is being written.",
    publishedAt: new Date("2024-04-01"),
  },
  {
    title: "Agile Isn't a Process — It's a Mindset. Here's How I Actually Run Sprint Planning",
    slug: "agile-mindset-sprint-planning",
    excerpt: "Most teams do Agile wrong. Here's the sprint planning format I've refined over 11 years that actually keeps teams moving.",
    category: "Agile",
    readTime: 6,
    content: "# Coming soon\n\nThis post is being written.",
    publishedAt: new Date("2024-04-15"),
  },
];

export async function seedBlogPosts(prisma: PrismaClient) {
  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { published: true },
      create: { ...post, published: true },
    });
  }
  const count = await prisma.blogPost.count({ where: { published: true } });
  console.log("✅ Seeded & published", count, "blog posts");
}

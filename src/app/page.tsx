import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Ticker } from "@/components/sections/Ticker";
import { Stats } from "@/components/sections/Stats";
import { Timeline } from "@/components/sections/Timeline";
import { WhatIDo } from "@/components/sections/WhatIDo";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { ForYou } from "@/components/sections/ForYou";
import { Contact } from "@/components/sections/Contact";
import { CommandPalette } from "@/components/layout/CommandPalette";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSkillMarqueeRows } from "@/models/skill";
import { getTimeline } from "@/models/experience";

// Nav + CommandPalette need client-side state — wrap in a client component
import { HomeClient } from "@/components/HomeClient";

// The page is statically rendered, and years of experience is computed against
// "now" at render time. Re-render daily so the figure ticks over on its own;
// admin edits revalidate "/" immediately.
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const { yearsOfExperience } = await getTimeline();
  return {
    description: `Principal Software Developer with ${yearsOfExperience}+ years in eCommerce, CRM, and enterprise systems. Leading teams, managing clients, and shipping products that matter.`,
    openGraph: {
      title: "Emdad Ullah — Principal Software Engineer",
      description: `Principal Software Developer with ${yearsOfExperience}+ years in eCommerce, CRM, and enterprise systems.`,
      type: "website",
    },
  };
}

async function getRecentPosts() {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 6,
    select: { title: true, slug: true, category: true, readTime: true, publishedAt: true },
  });
}

export default async function HomePage() {
  const [posts, skillRows, { entries, yearsOfExperience }] = await Promise.all([
    getRecentPosts(),
    getSkillMarqueeRows(),
    getTimeline(),
  ]);

  return (
    <>
      <HomeClient />
      <Hero yearsOfExperience={yearsOfExperience} />
      <Ticker yearsOfExperience={yearsOfExperience} />
      <Stats yearsOfExperience={yearsOfExperience} />
      <Timeline entries={entries} yearsOfExperience={yearsOfExperience} />
      <WhatIDo />
      <Skills row1={skillRows[1]} row2={skillRows[2]} />
      <Projects />
      <BlogPreview posts={posts} />
      <ForYou yearsOfExperience={yearsOfExperience} />
      <Contact />
      <Footer />
    </>
  );
}

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
import { prisma } from "@/lib/prisma";

// Nav + CommandPalette need client-side state — wrap in a client component
import { HomeClient } from "@/components/HomeClient";

async function getRecentPosts() {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 6,
    select: { title: true, slug: true, category: true, readTime: true, publishedAt: true },
  });
}

export default async function HomePage() {
  const posts = await getRecentPosts();

  return (
    <>
      <HomeClient />
      <Hero />
      <Ticker />
      <Stats />
      <Timeline />
      <WhatIDo />
      <Skills />
      <Projects />
      <BlogPreview posts={posts} />
      <ForYou />
      <Contact />
      <Footer />
    </>
  );
}

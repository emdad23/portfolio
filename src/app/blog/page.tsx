import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Emdad Ullah",
  description: "Thoughts on engineering, leadership, and building software that matters.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: { title: true, slug: true, excerpt: true, category: true, readTime: true, publishedAt: true },
  });

  return (
    <main className="min-h-screen bg-white pt-[88px]">
      <div className="px-[5%] py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[0.8rem] text-muted no-underline cursor-none hover:text-black transition-colors mb-12">← Back home</Link>
        <p className="text-[0.65rem] font-bold tracking-[3px] uppercase text-muted mb-3">Writing</p>
        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-[-2px] leading-[1.05] text-black mb-4">Blog & Writing</h1>
        <p className="text-[0.95rem] text-text2 leading-[1.78] max-w-xl mb-16">Thoughts on engineering leadership, system design, client management, and what it really takes to grow as a developer.</p>

        {posts.length === 0 ? (
          <div className="text-center py-24 text-muted">
            <div className="text-5xl mb-4">✍️</div>
            <p className="font-bold text-black mb-2">Coming soon</p>
            <p className="text-[0.85rem]">First posts are on their way.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md2:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="block bg-white p-8 no-underline cursor-none group hover:bg-black transition-colors duration-[220ms] min-h-[260px] flex flex-col justify-between">
                <div>
                  <p className="text-[0.65rem] font-bold tracking-[2px] uppercase text-muted mb-4 group-hover:text-white/40 transition-colors">{post.category}</p>
                  <h2 className="text-base font-extrabold text-black leading-[1.35] mb-3 group-hover:text-white transition-colors">{post.title}</h2>
                  <p className="text-[0.82rem] text-text2 leading-[1.7] group-hover:text-white/55 transition-colors line-clamp-3">{post.excerpt}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border group-hover:border-white/10 transition-colors mt-6">
                  <span className="text-[0.72rem] text-muted group-hover:text-white/35 transition-colors">
                    {post.readTime} min read{post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ""}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-gray flex items-center justify-center text-[0.8rem] border border-border group-hover:bg-white group-hover:text-black transition-all">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

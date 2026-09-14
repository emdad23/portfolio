import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug, published: true }, select: { title: true, excerpt: true } });
  if (!post) return { title: "Post not found" };
  return { title: `${post.title} — Emdad Ullah`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug, published: true } });
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-white pt-[88px]">
      <div className="px-[5%] py-16 max-w-[720px] mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[0.8rem] text-muted no-underline cursor-none hover:text-black transition-colors mb-12">← All posts</Link>

        <p className="text-[0.65rem] font-bold tracking-[3px] uppercase text-muted mb-4">{post.category}</p>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-1.5px] leading-[1.1] text-black mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 text-[0.78rem] text-muted mb-12 pb-12 border-b border-border">
          <span>{post.readTime} min read</span>
          {post.publishedAt && <><span>·</span><span>{formatDate(post.publishedAt)}</span></>}
        </div>

        <article className="prose prose-neutral max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-code:font-mono prose-code:text-[0.85em] prose-pre:bg-black prose-pre:text-white/80">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>

        <div className="mt-16 pt-12 border-t border-border">
          <p className="text-[0.85rem] text-muted mb-4">Found this useful? Let&apos;s connect.</p>
          <Link href="/#contact" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-md font-bold text-[0.875rem] no-underline cursor-none transition-all duration-[220ms] hover:bg-black-3 hover:shadow-[3px_3px_0_#444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">Get in touch →</Link>
        </div>
      </div>
    </main>
  );
}

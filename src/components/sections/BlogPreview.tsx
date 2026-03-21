import Link from "next/link";
import { BlogPost } from "@/types";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface Props {
  posts: Pick<BlogPost, "title" | "slug" | "category" | "readTime" | "publishedAt">[];
}

export function BlogPreview({ posts }: Props) {
  return (
    <section id="blog" className="py-[100px] px-[5%] bg-white">
      <ScrollReveal className="flex items-end justify-between mb-14">
        <div>
          <p className="text-[0.65rem] font-bold tracking-[3px] uppercase text-muted mb-2">Writing</p>
          <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] font-black tracking-[-1.5px] leading-[1.1] text-black">Thoughts on engineering & leadership.</h2>
        </div>
        <Link href="/blog" className="text-[0.78rem] font-semibold text-muted no-underline cursor-none flex items-center gap-1 hover:text-black transition-colors">All posts →</Link>
      </ScrollReveal>

      <div className="grid grid-cols-1 md2:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden">
        {posts.map((post, i) => (
          <ScrollReveal key={post.slug} delay={i * 0.07}>
            <Link href={`/blog/${post.slug}`} className="block bg-white p-8 cursor-none group hover:bg-black transition-colors duration-[220ms] min-h-[260px] flex flex-col justify-between no-underline h-full">
              <div>
                <p className="text-[0.65rem] font-bold tracking-[2px] uppercase text-muted mb-4 group-hover:text-white/40 transition-colors duration-[220ms]">{post.category}</p>
                <h3 className="text-base font-extrabold text-black leading-[1.35] group-hover:text-white transition-colors duration-[220ms]">{post.title}</h3>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border group-hover:border-white/10 transition-colors mt-6">
                <span className="text-[0.72rem] text-muted group-hover:text-white/35 transition-colors">{post.readTime} min read</span>
                <span className="w-7 h-7 rounded-full bg-gray flex items-center justify-center text-[0.8rem] border border-border group-hover:bg-white group-hover:text-black transition-all duration-[220ms]">→</span>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

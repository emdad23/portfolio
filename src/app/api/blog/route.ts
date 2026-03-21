import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, slug: true, excerpt: true, category: true, readTime: true, publishedAt: true },
    });
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Blog API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

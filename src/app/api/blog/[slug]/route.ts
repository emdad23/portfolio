import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug, published: true },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    console.error("Blog post API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

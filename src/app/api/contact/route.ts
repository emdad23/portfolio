import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, buildContactEmailHtml } from "@/lib/resend";
import { contactSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.safeParse(body);

    if (!data.success) {
      return NextResponse.json({ error: "Invalid data", details: data.error.flatten() }, { status: 400 });
    }

    const { name, email, subject, message, type } = data.data;

    // Save to DB
    await prisma.contactSubmission.create({
      data: { name, email, subject, message, type },
    });

    // Send email via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_your_api_key_here") {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "portfolio@emdad.dev",
        to: process.env.RESEND_TO_EMAIL ?? "emdad.ullah@reddotdigitalit.com",
        replyTo: email,
        subject: `[Portfolio] ${subject}`,
        html: buildContactEmailHtml({ name, email, subject, message, type }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

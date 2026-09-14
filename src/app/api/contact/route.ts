import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/mailer";
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

    // Notify. The submission is already stored, so a mail failure is logged but
    // never surfaced as an error — the caller would otherwise see a 500 for a
    // message that was in fact saved.
    const mail = await sendContactEmail({ name, email, subject, message, type });
    if (!mail.sent) {
      console.warn(`Contact email not sent (driver: ${mail.driver}): ${mail.reason}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

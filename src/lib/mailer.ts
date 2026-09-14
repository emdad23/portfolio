import nodemailer, { type Transporter } from "nodemailer";
import { buildContactEmailHtml, getResend } from "@/lib/resend";

/**
 * One mail entry point for the contact form, with two drivers:
 *
 *   smtp   — used whenever SMTP_HOST is set (Mailpit locally, :1025 SMTP / :8025 UI)
 *   resend — used in production, when a real RESEND_API_KEY is present
 *   none   — no transport configured; the submission is still persisted
 *
 * Both drivers render the body with `buildContactEmailHtml`, so the template
 * stays the single source of truth.
 */
export type MailDriver = "smtp" | "resend" | "none";

export type SendResult =
  | { sent: true; driver: Exclude<MailDriver, "none"> }
  | { sent: false; driver: MailDriver; reason: string };

const FROM_FALLBACK = "portfolio@emdad.dev";
const TO_FALLBACK = "emdad.ullah@reddotdigitalit.com";

/** A key that is still one of the documented placeholders is treated as absent. */
function hasRealResendKey(): boolean {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;
  return key.startsWith("re_") && !/your[_-]?(api[_-]?)?key/i.test(key);
}

export function resolveMailDriver(): MailDriver {
  if (process.env.SMTP_HOST?.trim()) return "smtp";
  if (hasRealResendKey()) return "resend";
  return "none";
}

function mailFrom() {
  return process.env.MAIL_FROM?.trim() || process.env.RESEND_FROM_EMAIL?.trim() || FROM_FALLBACK;
}

function mailTo() {
  return process.env.MAIL_TO?.trim() || process.env.RESEND_TO_EMAIL?.trim() || TO_FALLBACK;
}

// Cached across hot reloads in dev, the same way the Prisma client is.
const globalForMailer = globalThis as unknown as { smtpTransport?: Transporter };

function smtpTransport(): Transporter {
  if (globalForMailer.smtpTransport) return globalForMailer.smtpTransport;

  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port: Number(process.env.SMTP_PORT ?? 1025),
    // Mailpit listens in plaintext; STARTTLS/implicit TLS is opt-in via SMTP_SECURE.
    secure: process.env.SMTP_SECURE === "true",
    ignoreTLS: process.env.SMTP_SECURE !== "true",
    auth: user ? { user, pass } : undefined,
  });

  if (process.env.NODE_ENV !== "production") globalForMailer.smtpTransport = transport;
  return transport;
}

export type ContactEmail = {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
};

/**
 * Never throws — the caller has already persisted the submission, so a mail
 * failure must not turn a saved row into an error response.
 */
export async function sendContactEmail(payload: ContactEmail): Promise<SendResult> {
  const driver = resolveMailDriver();
  if (driver === "none") {
    return { sent: false, driver, reason: "No mail transport configured (set SMTP_HOST or RESEND_API_KEY)" };
  }

  const mail = {
    from: mailFrom(),
    to: mailTo(),
    replyTo: payload.email,
    subject: `[Portfolio] ${payload.subject}`,
    html: buildContactEmailHtml(payload),
  };

  try {
    if (driver === "smtp") {
      await smtpTransport().sendMail(mail);
    } else {
      const { error } = await getResend().emails.send(mail);
      if (error) throw error;
    }
    return { sent: true, driver };
  } catch (err) {
    return { sent: false, driver, reason: err instanceof Error ? err.message : String(err) };
  }
}

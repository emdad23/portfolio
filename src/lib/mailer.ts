import nodemailer, { type Transporter } from "nodemailer";
import { buildContactEmailHtml, getResend } from "@/lib/resend";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { getSettings } from "@/models/setting";

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

// The documented .env.example placeholders don't count as an override.
const PLACEHOLDER_TO = /^your@|@yourdomain\./i;

/**
 * An env var that overrides the `contact.email` setting as the recipient, so
 * dev and staging never mail the real inbox. The settings page reports it.
 */
export function mailToOverride(): { envVar: "MAIL_TO" | "RESEND_TO_EMAIL"; address: string } | null {
  for (const envVar of ["MAIL_TO", "RESEND_TO_EMAIL"] as const) {
    const address = process.env[envVar]?.trim();
    if (address && !PLACEHOLDER_TO.test(address)) return { envVar, address };
  }
  return null;
}

// Env override → the contact.email setting → its registry default.
async function mailTo(): Promise<string> {
  const override = mailToOverride();
  if (override) return override.address;
  try {
    return (await getSettings())["contact.email"];
  } catch (err) {
    console.warn("Contact email: could not read the contact.email setting, using the default:", err);
    return DEFAULT_SETTINGS["contact.email"];
  }
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
    to: await mailTo(),
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

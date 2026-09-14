import { Resend } from "resend";

let client: Resend | null = null;

/**
 * Lazy — the Resend constructor throws when no API key is present, so building
 * it at module scope would break every import of this file (the email template
 * included) on an installation that only uses SMTP. Call this from the Resend
 * driver in `@/lib/mailer` only, after the key has been checked.
 */
export function getResend(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export function buildContactEmailHtml({
  name,
  email,
  subject,
  message,
  type,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
}) {
  const typeLabel = type === "hiring" ? "💼 Company / Hiring" : "🎓 Junior Developer";
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #E4E4E7;border-radius:12px;overflow:hidden">
      <div style="background:#0A0A0A;padding:24px 32px">
        <p style="color:rgba(255,255,255,.45);font-size:12px;margin:0;letter-spacing:2px;text-transform:uppercase">New Portfolio Contact</p>
        <h1 style="color:#fff;font-size:22px;margin:8px 0 0;letter-spacing:-0.5px">${subject}</h1>
      </div>
      <div style="padding:32px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;width:100px">From</td><td style="padding:8px 0;font-size:14px;color:#0A0A0A;font-weight:600">${name} &lt;${email}&gt;</td></tr>
          <tr><td style="padding:8px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px">Type</td><td style="padding:8px 0;font-size:14px;color:#0A0A0A">${typeLabel}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #E4E4E7;margin:20px 0"/>
        <p style="font-size:14px;color:#444;line-height:1.78;white-space:pre-wrap">${message}</p>
        <hr style="border:none;border-top:1px solid #E4E4E7;margin:20px 0"/>
        <a href="mailto:${email}" style="display:inline-block;background:#0A0A0A;color:#fff;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:700;text-decoration:none">Reply to ${name} →</a>
      </div>
      <div style="background:#F4F4F5;padding:16px 32px">
        <p style="font-size:11px;color:#888;margin:0">Sent via emdad.dev portfolio contact form</p>
      </div>
    </div>
  `;
}

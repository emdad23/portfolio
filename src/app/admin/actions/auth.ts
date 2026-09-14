"use server";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adminHref, getAdminPath } from "@/lib/auth/config";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations";
import { findAdminByEmail } from "@/models/admin-user";

export type LoginState = { error?: string; email?: string };

// Every bad login gets this, so the form never reveals whether an email exists.
const INVALID = "Invalid email or password.";

// Compared against when the email is unknown, so that path costs a full bcrypt
// round too (same cost factor as `admin:create`) and timing reveals nothing.
const DUMMY_HASH = "$2b$12$Yz25taHyeRh4kVZIOtlR4OeaIQFRTVjBJvhBv9d07m0lxU7eFGDZu";

// In-memory throttle: 5 attempts per IP per 15 minutes, cleared by a successful
// login. Per server instance, which is enough for a single admin. Attempts are
// counted *before* the password check, so a burst of parallel requests can't all
// slip in under the limit. The IP comes from X-Forwarded-For, so the host must
// set that header itself (Vercel does); otherwise a client can rotate it.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(): string {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Records an attempt; returns the minutes left when this IP is over the limit. */
function throttle(ip: string, now: number): number | null {
  if (attempts.size > 1000) {
    attempts.forEach((entry, key) => {
      if (entry.resetAt <= now) attempts.delete(key);
    });
  }
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  if (entry.count >= MAX_ATTEMPTS) return Math.ceil((entry.resetAt - now) / 60_000);
  entry.count++;
  return null;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!getAdminPath()) notFound();

  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { email, error: INVALID };

  const ip = clientIp();
  const minutesLeft = throttle(ip, Date.now());
  if (minutesLeft !== null) {
    return {
      email,
      error: `Too many attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
    };
  }

  const admin = await findAdminByEmail(parsed.data.email);
  const valid = await bcrypt.compare(parsed.data.password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !valid) return { email, error: INVALID };

  attempts.delete(ip);
  cookies().set(SESSION_COOKIE, await signSession(admin.id), sessionCookieOptions);
  redirect(adminHref("/"));
}

export async function logoutAction(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
  redirect(getAdminPath() ? adminHref("/login") : "/");
}

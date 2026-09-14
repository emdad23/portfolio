// Admin session token: a signed JWT (HS256, AUTH_SECRET) in an httpOnly cookie.
// Edge-safe — jose only, no Prisma or next/headers — so middleware can verify it.
// A valid signature is not enough on its own: requireAdmin() in ./admin also
// checks that the admin still exists and hasn't had their password reset since.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds
const MIN_SECRET_LENGTH = 32;
const ALG = "HS256";

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  // Off in dev so the cookie works over http://localhost. `next start` locally is
  // production, so it needs https (or the login silently won't stick).
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
} as const;

export type Session = { adminId: string; issuedAt: number };

function getSecret(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  return secret && secret.length >= MIN_SECRET_LENGTH ? new TextEncoder().encode(secret) : null;
}

export function hasSessionSecret() {
  return getSecret() !== null;
}

export async function signSession(adminId: string): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error(`AUTH_SECRET must be at least ${MIN_SECRET_LENGTH} characters`);
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: ALG })
    .setSubject(adminId)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_MAX_AGE)
    .sign(secret);
}

/** The session in a token, or null when it is missing, tampered with or expired. */
export async function verifySession(token: string | undefined): Promise<Session | null> {
  const secret = getSecret();
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALG],
      requiredClaims: ["sub", "iat", "exp"],
    });
    return { adminId: payload.sub!, issuedAt: payload.iat! };
  } catch {
    return null;
  }
}

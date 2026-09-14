// Server-side admin guard. Middleware only checks the cookie's signature, so
// this is the real check: every admin page that loads data and every admin server
// action calls requireAdmin(). A layout's check alone isn't enough, because
// layouts and pages render in parallel.
import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { findAdminById } from "@/models/admin-user";
import { adminHref, getAdminPath } from "./config";
import { SESSION_COOKIE, verifySession } from "./session";

export { adminHref };

export type Admin = { id: string; email: string };

/** The signed-in admin, or null. */
export async function getAdmin(): Promise<Admin | null> {
  if (!getAdminPath()) return null;
  const session = await verifySession(cookies().get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const admin = await findAdminById(session.adminId);
  if (!admin) return null;
  // `npm run admin:create` resets a password by updating the row, which retires
  // every session issued before it (iat is in whole seconds, hence the floor).
  if (Math.floor(admin.updatedAt.getTime() / 1000) > session.issuedAt) return null;

  return { id: admin.id, email: admin.email };
}

/** The signed-in admin; otherwise redirects to login (or 404s when the admin is disabled). */
export async function requireAdmin(): Promise<Admin> {
  if (!getAdminPath()) notFound();
  const admin = await getAdmin();
  if (!admin) redirect(adminHref("/login"));
  return admin;
}

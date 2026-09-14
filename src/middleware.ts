// Hides the admin behind a secret URL prefix (see src/lib/auth/config.ts):
//   /admin…         → the normal 404, so the internal routes can't be reached directly
//   /<ADMIN_PATH>…  → rewritten to /admin…, redirecting to login without a valid session
// This is a convenience gate: it checks the cookie's signature only, not that the
// admin still exists. requireAdmin() in every admin page and action is the real check.
import { NextResponse, type NextRequest } from "next/server";
import { getAdminPath } from "@/lib/auth/config";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

// No route lives here, so a rewrite to it renders the app's 404 with a 404 status.
const NOT_FOUND_PATH = "/__not-found";

function isWithin(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function decodePath(pathname: string) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export async function middleware(req: NextRequest) {
  // Decoded, so /%61dmin can't sneak past the /admin check.
  const pathname = decodePath(req.nextUrl.pathname);
  if (isWithin(pathname, "/admin")) {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, req.url));
  }

  const adminPath = getAdminPath();
  if (!adminPath || !isWithin(pathname, `/${adminPath}`)) return NextResponse.next();

  const rest = pathname.slice(adminPath.length + 1); // "", "/login", "/skills", …

  // Server actions are let through: they call requireAdmin() themselves, whose
  // redirect the client router follows. A 307 here would replay the action's POST
  // against the login page instead.
  const isServerAction = req.method === "POST" && req.headers.has("next-action");
  if (rest !== "/login" && !isServerAction) {
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) return NextResponse.redirect(new URL(`/${adminPath}/login`, req.url));
  }

  const url = req.nextUrl.clone();
  url.pathname = `/admin${rest}`;
  const res = NextResponse.rewrite(url);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico).*)"],
};

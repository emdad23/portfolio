// Where the admin lives. Edge-safe, shared by middleware and server code.
//
// The admin is served under a secret prefix, /<ADMIN_PATH>/…, which middleware
// rewrites to the internal /admin/… routes. It is enabled only when ADMIN_PATH is
// a valid segment AND AUTH_SECRET is usable; otherwise every admin URL is a 404.
import { hasSessionSecret } from "./session";

// Segments that would collide with real routes (or with the internal /admin).
const RESERVED = ["admin", "api", "blog", "_next"];

let warned = false;

export function getAdminPath(): string | null {
  const segment = process.env.ADMIN_PATH?.trim().replace(/^\/+|\/+$/g, "");
  if (!segment) return null;

  const problem = !/^[A-Za-z0-9_-]+$/.test(segment)
    ? "ADMIN_PATH must be a single URL segment of letters, digits, - or _"
    : RESERVED.includes(segment.toLowerCase())
      ? `ADMIN_PATH cannot be "${segment}"`
      : !hasSessionSecret()
        ? "AUTH_SECRET is missing or shorter than 32 characters"
        : null;
  if (problem) {
    if (!warned) console.warn(`[admin] disabled: ${problem}`);
    warned = true;
    return null;
  }
  return segment;
}

/** Public URL for an admin page: adminHref("/skills") → "/<ADMIN_PATH>/skills". */
export function adminHref(path = "/"): string {
  const segment = getAdminPath();
  if (!segment) throw new Error("The admin is disabled (see ADMIN_PATH / AUTH_SECRET)");
  if (path === "/" || path === "") return `/${segment}`;
  return `/${segment}${path.startsWith("/") ? path : `/${path}`}`;
}

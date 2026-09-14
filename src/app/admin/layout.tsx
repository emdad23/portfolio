import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminPath } from "@/lib/auth/config";

// Only ever reached through the /<ADMIN_PATH> rewrite in src/middleware.ts,
// which also sends X-Robots-Tag. Never link to it from the public site.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already 404s these routes when the admin is disabled; this is the
  // backstop in case a request reaches them some other way.
  if (!getAdminPath()) notFound();
  return children;
}

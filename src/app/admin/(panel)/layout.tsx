import Link from "next/link";
import { secondaryButtonClass } from "@/components/admin/styles";
import { adminHref, requireAdmin } from "@/lib/auth/admin";
import { logoutAction } from "../actions/auth";
import { AdminNav } from "./AdminNav";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  // Experience joins the nav when its manager lands (task 10).
  const links = [
    { href: adminHref("/"), label: "Dashboard" },
    { href: adminHref("/skills"), label: "Skills" },
  ];

  return (
    <div className="min-h-[100svh] bg-white">
      <header className="border-b border-border px-5 md2:px-[5%]">
        {/* Phones: brand + account on the first line, nav wraps to a full-width second line. */}
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center gap-x-6 gap-y-1 py-2">
          <Link href={adminHref("/")} className="inline-flex items-center min-h-11 font-black tracking-[-0.02em] text-black no-underline cursor-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
            Admin
          </Link>
          <AdminNav links={links} />
          <div className="ml-auto flex items-center gap-3 min-w-0">
            <span className="text-[0.8rem] text-muted truncate min-w-0">{admin.email}</span>
            <form action={logoutAction}>
              <button type="submit" className={secondaryButtonClass}>Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="px-5 md2:px-[5%] py-10">
        <div className="max-w-[1200px] mx-auto">{children}</div>
      </main>
    </div>
  );
}

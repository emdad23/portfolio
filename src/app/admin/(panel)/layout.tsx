import Link from "next/link";
import { adminHref, requireAdmin } from "@/lib/auth/admin";
import { logoutAction } from "../actions/auth";

// Minimal shell for now; task 9 adds the Skills / Experience navigation.
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-[100svh] bg-white">
      <header className="border-b border-border px-5 md2:px-[5%]">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
          <Link href={adminHref("/")} className="inline-flex items-center min-h-11 font-black tracking-[-0.02em] text-black no-underline cursor-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
            Admin
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[0.8rem] text-muted truncate min-w-0">{admin.email}</span>
            <form action={logoutAction}>
              <button type="submit" className="min-h-11 px-4 rounded-md border border-black bg-white text-black text-[0.8rem] font-bold cursor-none transition-all duration-[220ms] hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
                Log out
              </button>
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

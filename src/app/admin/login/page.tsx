import { redirect } from "next/navigation";
import { adminHref, getAdmin } from "@/lib/auth/admin";
import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage() {
  // Checked here rather than in middleware: this looks the admin up in the DB, so
  // a validly signed cookie for a deleted admin shows the form instead of looping
  // between login and the dashboard.
  if (await getAdmin()) redirect(adminHref("/"));

  return (
    <main className="min-h-[100svh] bg-gray flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[25rem] bg-white border border-border rounded-xl p-6 sm:p-9">
        <p className="text-[0.65rem] font-bold tracking-[0.25em] uppercase text-muted mb-2">Admin</p>
        <h1 className="text-[clamp(1.5rem,4vw,1.9rem)] font-black tracking-[-0.03em] leading-[1.1] text-black mb-6">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}

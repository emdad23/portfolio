import { requireAdmin } from "@/lib/auth/admin";

// Placeholder dashboard; task 9 adds the years, skill and experience counts.
export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  return (
    <>
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.03em] leading-[1.1] text-black mb-3">Dashboard</h1>
      <p className="text-[0.95rem] text-text2 max-w-[65ch] break-words">Signed in as {admin.email}.</p>
    </>
  );
}

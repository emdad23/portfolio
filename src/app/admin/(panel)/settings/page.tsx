import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { mailToOverride, resolveMailDriver } from "@/lib/mailer";
import { getSettings, settingsUpdatedAt } from "@/models/setting";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Settings · Admin" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings, updatedAt] = await Promise.all([getSettings(), settingsUpdatedAt()]);

  return (
    <>
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.03em] leading-[1.1] text-black mb-2">Settings</h1>
      <p className="text-[0.95rem] text-text2 max-w-[65ch] mb-8">
        Headline numbers and contact details used across the home page.
      </p>
      <SettingsForm
        values={settings}
        // Remounts the inputs after a save, so they show the stored (normalised) values.
        version={updatedAt?.getTime() ?? 0}
        mail={{ override: mailToOverride(), driver: resolveMailDriver() }}
      />
    </>
  );
}

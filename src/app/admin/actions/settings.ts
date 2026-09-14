"use server";
import { revalidatePath } from "next/cache";
import { fieldErrors, type ActionState } from "@/lib/actionState";
import { requireAdmin } from "@/lib/auth/admin";
import { SETTING_KEYS, type SettingKey } from "@/lib/settings";
import { settingsSchema } from "@/lib/validations";
import { saveSettings } from "@/models/setting";

export type SettingsFormState = ActionState<SettingKey>;

// Saves every registered key at once. Only registered keys are read from the
// form, so anything else posted is ignored.
export async function saveSettingsAction(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdmin();
  const raw = Object.fromEntries(SETTING_KEYS.map((key) => [key, formData.get(key) ?? ""]));
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  await saveSettings(parsed.data);
  // Settings only render on the home page, plus the admin dashboard.
  revalidatePath("/");
  revalidatePath("/admin", "layout");
  return { savedAt: Date.now() };
}

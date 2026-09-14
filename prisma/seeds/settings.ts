import type { PrismaClient } from "../../src/generated/prisma/client";
import { DEFAULT_SETTINGS, SETTING_KEYS } from "../../src/lib/settings";

// Inserts any registered key that has no row yet. Existing rows are the
// admin's, so a reseed adds new keys but never overwrites an edit.
export async function seedSettings(prisma: PrismaClient) {
  const { count } = await prisma.setting.createMany({
    data: SETTING_KEYS.map((key) => ({ key, value: DEFAULT_SETTINGS[key] })),
    skipDuplicates: true,
  });
  console.log(count > 0 ? `✅ Seeded ${count} settings` : "↷ Settings all present, skipped");
}

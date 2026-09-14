// Setting model: every query against the Setting table goes through here.
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS, SETTING_KEYS, type Settings } from "@/lib/settings";

// Every registered key, with the default filling in for a missing row.
// Cached per request.
export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await prisma.setting.findMany({ where: { key: { in: SETTING_KEYS } } });
  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) settings[row.key as keyof Settings] = row.value;
  return settings;
});

// When any registered setting was last written, or null if none has a row.
export async function settingsUpdatedAt(): Promise<Date | null> {
  const { _max } = await prisma.setting.aggregate({ where: { key: { in: SETTING_KEYS } }, _max: { updatedAt: true } });
  return _max.updatedAt;
}

export function saveSettings(values: Settings) {
  return prisma.$transaction(
    SETTING_KEYS.map((key) =>
      prisma.setting.upsert({ where: { key }, create: { key, value: values[key] }, update: { value: values[key] } }),
    ),
  );
}

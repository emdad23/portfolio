// Site settings: the key registry, defaults and display helpers. The values live
// in the Setting table (key/value, see src/models/setting.ts); this module is
// Prisma- and zod-free so client components can import it.

export const SETTING_GROUPS = [
  { id: "stats", title: "Headline stats", description: "Numbers in the hero and the stats band. Counts are shown with their “+” where the design has one." },
  { id: "location", title: "Location", description: "Where you are, in the hero, contact section and footer." },
  { id: "contact", title: "Contact", description: "Shown in the contact section and the ⌘K menu." },
] as const;

export type SettingGroup = (typeof SETTING_GROUPS)[number]["id"];

export type SettingInput = "count" | "text" | "email" | "tel" | "url";

type SettingDefinition = {
  group: SettingGroup;
  label: string;
  hint: string;
  input: SettingInput;
  maxLength: number;
  default: string;
};

export const SETTINGS = {
  "stats.concurrentProjects": {
    group: "stats",
    label: "Concurrent projects",
    hint: "Stats “Concurrent Projects” and the hero “Projects at once” tile. The “7 concurrent projects” wording in What I Do and on your experience entry is written text and won’t change.",
    input: "count",
    maxLength: 6,
    default: "7",
  },
  "stats.companiesLed": {
    group: "stats",
    label: "Companies",
    hint: "Stats “Companies Led” and the hero “Worked with … companies”, both with a “+”.",
    input: "count",
    maxLength: 6,
    default: "4",
  },
  "stats.linkedinConnections": {
    group: "stats",
    label: "LinkedIn connections",
    hint: "The hero “… LinkedIn connections” line, with a “+”.",
    input: "count",
    maxLength: 6,
    default: "500",
  },
  "location.flag": {
    group: "location",
    label: "Flag",
    hint: "One emoji, on the hero location tile.",
    input: "text",
    maxLength: 16,
    default: "🇧🇩",
  },
  "location.short": {
    group: "location",
    label: "Short location",
    hint: "The hero location tile, e.g. “Dhaka, BD”.",
    input: "text",
    maxLength: 40,
    default: "Dhaka, BD",
  },
  "location.full": {
    group: "location",
    label: "Full location",
    hint: "The contact section and the footer.",
    input: "text",
    maxLength: 80,
    default: "Dhaka, Bangladesh",
  },
  "contact.email": {
    group: "contact",
    label: "Email",
    hint: "Shown on the site, and receives contact-form mail.",
    input: "email",
    maxLength: 254,
    default: "emdad.ullah@reddotdigitalit.com",
  },
  "contact.phone": {
    group: "contact",
    label: "Phone / WhatsApp",
    hint: "Written the way it should be shown. The call link uses only the + and digits.",
    input: "tel",
    maxLength: 40,
    default: "+880 1833 184053",
  },
  "contact.linkedinUrl": {
    group: "contact",
    label: "LinkedIn profile URL",
    hint: "The full https://www.linkedin.com/in/… address.",
    input: "url",
    maxLength: 300,
    default: "https://www.linkedin.com/in/emdad-ullah-41956756/",
  },
} as const satisfies Record<string, SettingDefinition>;

export type SettingKey = keyof typeof SETTINGS;

export type Settings = Record<SettingKey, string>;

export const SETTING_KEYS = Object.keys(SETTINGS) as SettingKey[];

export const DEFAULT_SETTINGS = Object.fromEntries(SETTING_KEYS.map((key) => [key, SETTINGS[key].default])) as Settings;

// A count as a number. Values are validated on save, but a row edited by hand
// (Prisma Studio) could hold anything, so fall back to the default.
export function settingInt(settings: Settings, key: SettingKey): number {
  const value = Number(settings[key]);
  return Number.isSafeInteger(value) && value >= 0 ? value : Number(SETTINGS[key].default);
}

export type ContactDetails = { email: string; phone: string; linkedinUrl: string };

export function contactDetails(settings: Settings): ContactDetails {
  return { email: settings["contact.email"], phone: settings["contact.phone"], linkedinUrl: settings["contact.linkedinUrl"] };
}

// "+880 1833 184053" → "tel:+8801833184053"
export function telHref(phone: string): string {
  const trimmed = phone.trim();
  return `tel:${trimmed.startsWith("+") ? "+" : ""}${trimmed.replace(/\D/g, "")}`;
}

// "https://www.linkedin.com/in/emdad-ullah-41956756/" → "linkedin.com/in/emdad-ullah-41956756"
export function linkedinDisplay(url: string): string {
  return url.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}

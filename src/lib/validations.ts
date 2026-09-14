import { z } from "zod";
import { CONTACT_TYPES } from "@/lib/contactType";
import { METRIC_TYPES, fromMonthValue } from "@/lib/experience";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
  type: z.enum(CONTACT_TYPES),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Form inputs arrive as strings; a blank number field is "missing", not 0.
const blankToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Keep it under 60 characters"),
  icon: z
    .string()
    .trim()
    .max(16, "Use one emoji or a short symbol")
    .transform((v) => v || null),
  row: z.coerce.number().pipe(z.union([z.literal(1), z.literal(2)], { error: "Row must be 1 or 2" })),
  sortOrder: z.preprocess(
    blankToUndefined,
    z.coerce
      .number({ error: "Enter a whole number" })
      .int("Enter a whole number")
      .min(0, "Must be 0 or more")
      .max(9999, "Must be 9999 or less"),
  ),
});

// ─── Experience ───────────────────────────────────────────────────────────────
// The admin form posts scalar fields as-is, month inputs as "YYYY-MM", checkboxes
// as "on" when ticked, and the repeatable metrics/projects rows as JSON strings.
// Output matches ExperienceInput in src/models/experience.ts.

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v ?? ""),
    z.string().max(max, `Keep it under ${max} characters`).transform((v) => v || null),
  );

const jsonField = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => {
    if (typeof v !== "string") return v;
    try {
      return JSON.parse(v);
    } catch {
      return undefined;
    }
  }, schema);

const metricSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(80, "Keep it under 80 characters"),
  type: z.enum(METRIC_TYPES, { error: "Pick a style" }),
});

const projectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Keep it under 80 characters"),
  icon: z.string().trim().max(16, "Use one emoji or a short symbol"),
  // "Magento 2, Vue.js" → ["Magento 2", "Vue.js"]
  tags: z
    .string()
    .max(400, "Too many tags")
    .transform((s) => s.split(",").map((t) => t.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(40, "Keep each tag under 40 characters")).max(20, "Up to 20 tags")),
});

export const experienceSchema = z
  .object({
    role: z.string().trim().min(1, "Role is required").max(120, "Keep it under 120 characters"),
    company: z.string().trim().min(1, "Company is required").max(120, "Keep it under 120 characters"),
    companyLink: z.preprocess(
      (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
      z.url({ protocol: /^https?$/, error: "Enter a full URL, starting with https://" }).max(300).nullable(),
    ),
    startMonth: z.string({ error: "Pick a start month" }).regex(MONTH, "Pick a start month"),
    present: checkbox,
    // Not posted at all while Present disables the input.
    endMonth: z.string().nullish(),
    periodLabel: optionalText(60),
    countsTowardExperience: checkbox,
    description: z.string().trim().min(1, "Description is required").max(5000, "Keep it under 5000 characters"),
    metrics: jsonField(z.array(metricSchema, { error: "Metrics could not be read" }).max(20, "Up to 20 metrics")),
    projects: jsonField(z.array(projectSchema, { error: "Projects could not be read" }).max(20, "Up to 20 projects")),
  })
  .superRefine((d, ctx) => {
    if (d.present) return;
    if (!d.endMonth || !MONTH.test(d.endMonth)) {
      ctx.addIssue({ code: "custom", path: ["endMonth"], message: "Pick an end month, or tick Present" });
    } else if (d.endMonth < d.startMonth) {
      // Fixed-width "YYYY-MM" strings compare in date order.
      ctx.addIssue({ code: "custom", path: ["endMonth"], message: "The end can't be before the start" });
    }
  })
  .transform((d) => ({
    role: d.role,
    company: d.company,
    companyLink: d.companyLink,
    startDate: fromMonthValue(d.startMonth),
    endDate: d.present || !d.endMonth ? null : fromMonthValue(d.endMonth),
    periodLabel: d.periodLabel,
    countsTowardExperience: d.countsTowardExperience,
    description: d.description,
    // "default" is stored as no type, the same as the seeded rows.
    metrics: d.metrics.map((m) => (m.type === "default" ? { label: m.label } : m)),
    projects: d.projects,
  }));

// Deliberately loose: a login only ever answers with one generic error.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

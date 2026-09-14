import { z } from "zod";
import { CONTACT_TYPES } from "@/lib/contactType";

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

// Deliberately loose: a login only ever answers with one generic error.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrors, isRecordNotFound, type ActionState } from "@/lib/actionState";
import { adminHref, requireAdmin } from "@/lib/auth/admin";
import { experienceSchema } from "@/lib/validations";
import * as experiences from "@/models/experience";

export type ExperienceFormState = ActionState;

const idSchema = z.string().min(1);
const GONE = "This entry no longer exists. It may have been deleted in another tab.";

// The home page (timeline + every years figure) and every admin page.
function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

function readExperience(formData: FormData) {
  const fields = ["role", "company", "companyLink", "startMonth", "present", "endMonth", "periodLabel",
    "countsTowardExperience", "description", "metrics", "projects"] as const;
  return Object.fromEntries(fields.map((field) => [field, formData.get(field)]));
}

export async function createExperienceAction(_prev: ExperienceFormState, formData: FormData): Promise<ExperienceFormState> {
  await requireAdmin();
  const parsed = experienceSchema.safeParse(readExperience(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  await experiences.createExperience(parsed.data);
  revalidate();
  redirect(adminHref("/experience"));
}

export async function updateExperienceAction(_prev: ExperienceFormState, formData: FormData): Promise<ExperienceFormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { message: GONE };
  const parsed = experienceSchema.safeParse(readExperience(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  try {
    await experiences.updateExperience(id.data, parsed.data);
  } catch (error) {
    if (!isRecordNotFound(error)) throw error;
    return { message: GONE };
  }
  revalidate();
  redirect(adminHref("/experience"));
}

export async function deleteExperienceAction(_prev: ExperienceFormState, formData: FormData): Promise<ExperienceFormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { message: GONE };

  try {
    await experiences.deleteExperience(id.data);
  } catch (error) {
    // Already gone is the outcome that was asked for.
    if (!isRecordNotFound(error)) throw error;
  }
  revalidate();
  return { savedAt: Date.now() };
}

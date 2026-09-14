"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fieldErrors, isRecordNotFound, type ActionState } from "@/lib/actionState";
import { requireAdmin } from "@/lib/auth/admin";
import { skillSchema } from "@/lib/validations";
import * as skills from "@/models/skill";

export type SkillField = "name" | "icon" | "row" | "sortOrder";
export type SkillFormState = ActionState<SkillField>;

const idSchema = z.string().min(1);
const GONE = "This skill no longer exists. The list has been refreshed.";

// The home marquee, plus every admin page (the dashboard shows the count).
function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

function readSkill(formData: FormData) {
  return {
    name: formData.get("name") ?? "",
    icon: formData.get("icon") ?? "",
    row: formData.get("row"),
    sortOrder: formData.get("sortOrder"),
  };
}

// New skills go to the end of their row; the order is edited afterwards.
export async function createSkillAction(_prev: SkillFormState, formData: FormData): Promise<SkillFormState> {
  await requireAdmin();
  const parsed = skillSchema.omit({ sortOrder: true }).safeParse(readSkill(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  await skills.createSkill({ ...parsed.data, sortOrder: await skills.nextSkillSortOrder(parsed.data.row) });
  revalidate();
  return { savedAt: Date.now() };
}

export async function updateSkillAction(_prev: SkillFormState, formData: FormData): Promise<SkillFormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { message: GONE };
  const parsed = skillSchema.safeParse(readSkill(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  try {
    await skills.updateSkill(id.data, parsed.data);
  } catch (error) {
    if (!isRecordNotFound(error)) throw error;
    revalidate();
    return { message: GONE };
  }
  revalidate();
  return { savedAt: Date.now() };
}

export async function deleteSkillAction(_prev: SkillFormState, formData: FormData): Promise<SkillFormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { message: GONE };

  try {
    await skills.deleteSkill(id.data);
  } catch (error) {
    // Already gone is the outcome that was asked for.
    if (!isRecordNotFound(error)) throw error;
  }
  revalidate();
  return { savedAt: Date.now() };
}

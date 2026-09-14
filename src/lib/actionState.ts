// Shared shape for admin form actions used with useFormState.
import { z } from "zod";

export type ActionState<Field extends string = string> = {
  // First message per invalid field, shown inline. Nested fields use dotted
  // paths, e.g. "projects.1.name".
  errors?: Partial<Record<Field, string>>;
  // A form-level problem (e.g. the record was deleted elsewhere).
  message?: string;
  // Set on success; a new value each time, so a form can react to every save.
  savedAt?: number;
};

export function fieldErrors<Field extends string>(error: z.ZodError): Partial<Record<Field, string>> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    errors[issue.path.join(".") || "form"] ??= issue.message;
  }
  return errors as Partial<Record<Field, string>>;
}

// Prisma's "record to update/delete does not exist".
export function isRecordNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2025";
}

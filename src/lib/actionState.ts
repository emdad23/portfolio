// Shared shape for admin form actions used with useFormState.
import { z } from "zod";

export type ActionState<Field extends string = string> = {
  // First message per invalid field, shown inline.
  errors?: Partial<Record<Field, string>>;
  // A form-level problem (e.g. the record was deleted elsewhere).
  message?: string;
  // Set on success; a new value each time, so a form can react to every save.
  savedAt?: number;
};

export function fieldErrors<Field extends string>(error: z.ZodError): Partial<Record<Field, string>> {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(
    Object.entries(flat).flatMap(([field, messages]) => (messages?.length ? [[field, messages[0]]] : [])),
  ) as Partial<Record<Field, string>>;
}

// Prisma's "record to update/delete does not exist".
export function isRecordNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2025";
}

"use client";
import { useFormStatus } from "react-dom";
import { primaryButtonClass, secondaryButtonClass } from "./styles";

// Disables itself and swaps its label while the enclosing form's action runs.
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${variant === "primary" ? primaryButtonClass : secondaryButtonClass} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

// Label + control + optional hint + inline error, stacked. No hooks, so both
// server and client components can use it.
import { errorClass, labelClass } from "./styles";

export function Field({
  label,
  id,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children}
      {hint && <p id={`${id}-hint`} className="text-[0.75rem] text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className={errorClass}>{error}</p>}
    </div>
  );
}

// id + aria wiring for the control inside a <Field> with the same id.
export function fieldProps(id: string, error?: string, hint?: boolean) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return { id, "aria-invalid": !!error, "aria-describedby": describedBy || undefined };
}

// A checkbox with its label as a ≥44px tap target.
export function Checkbox({
  label,
  hint,
  className = "",
  ...input
}: { label: string; hint?: string; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="inline-flex items-center gap-3 min-h-11 text-[0.875rem] font-semibold text-black cursor-none self-start">
        <input type="checkbox" {...input}
          className="w-5 h-5 accent-black cursor-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2" />
        {label}
      </label>
      {hint && <p className="text-[0.75rem] text-muted -mt-1 pl-8">{hint}</p>}
    </div>
  );
}

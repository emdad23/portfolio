"use client";
import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { fieldClass, labelClass } from "@/components/admin/styles";
import { loginAction, type LoginState } from "../actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);
  const describedBy = state.error ? "login-error" : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="login-email" className={labelClass}>Email</label>
        <input id="login-email" name="email" type="email" required autoComplete="username" autoCapitalize="none" spellCheck={false}
          defaultValue={state.email} aria-invalid={!!state.error} aria-describedby={describedBy} className={fieldClass()} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="login-password" className={labelClass}>Password</label>
        <input id="login-password" name="password" type="password" required autoComplete="current-password"
          aria-invalid={!!state.error} aria-describedby={describedBy} className={fieldClass()} />
      </div>

      {state.error && (
        <p id="login-error" role="alert" className="text-[0.8rem] text-red-500">{state.error}</p>
      )}

      <SubmitButton pendingLabel="Signing in..." className="mt-2 w-full">Sign in →</SubmitButton>
    </form>
  );
}

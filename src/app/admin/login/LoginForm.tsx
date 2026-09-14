"use client";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "../actions/auth";

const initialState: LoginState = {};

const fieldClass =
  "w-full min-h-11 px-[0.88rem] rounded-md border border-border bg-white font-sans text-base md2:text-[0.83rem] text-black outline-none cursor-none transition-all focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,.06)]";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full min-h-11 bg-black text-white rounded-md font-bold text-[0.875rem] cursor-none transition-all duration-[220ms] hover:bg-black-3 hover:shadow-[3px_3px_0_#444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-60 disabled:bg-black disabled:shadow-none"
    >
      {pending ? "Signing in..." : "Sign in →"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);
  const describedBy = state.error ? "login-error" : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="login-email" className="text-[0.75rem] font-bold text-text2">Email</label>
        <input id="login-email" name="email" type="email" required autoComplete="username" autoCapitalize="none" spellCheck={false}
          defaultValue={state.email} aria-invalid={!!state.error} aria-describedby={describedBy} className={fieldClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="login-password" className="text-[0.75rem] font-bold text-text2">Password</label>
        <input id="login-password" name="password" type="password" required autoComplete="current-password"
          aria-invalid={!!state.error} aria-describedby={describedBy} className={fieldClass} />
      </div>

      {state.error && (
        <p id="login-error" role="alert" className="text-[0.8rem] text-red-500">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}

// Class strings shared by the admin UI. A plain module, not "use client", so
// server components (the panel layout) can import them as real strings.

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

// 16px text below md2 stops iOS zooming into a focused input.
export function fieldClass(invalid = false) {
  return `w-full min-h-11 px-[0.88rem] rounded-md border bg-white font-sans text-base md2:text-[0.83rem] text-black outline-none cursor-none transition-all focus:shadow-[0_0_0_3px_rgba(0,0,0,.06)] ${
    invalid ? "border-red-500 focus:border-red-500" : "border-border focus:border-black"
  }`;
}

export const labelClass = "text-[0.75rem] font-bold text-text2";

export const errorClass = "text-[0.75rem] text-red-500";

export const primaryButtonClass = `inline-flex items-center justify-center min-h-11 px-5 rounded-md bg-black text-white font-bold text-[0.83rem] whitespace-nowrap cursor-none transition-all duration-[220ms] hover:bg-black-3 hover:shadow-[3px_3px_0_#444] ${focusRing} disabled:opacity-60 disabled:bg-black disabled:shadow-none`;

export const secondaryButtonClass = `inline-flex items-center justify-center min-h-11 px-4 rounded-md border border-black bg-white text-black font-bold text-[0.8rem] whitespace-nowrap cursor-none transition-all duration-[220ms] hover:bg-black hover:text-white ${focusRing} disabled:opacity-60`;

export const navLinkClass = `inline-flex items-center min-h-11 px-3 rounded-md text-[0.83rem] font-semibold no-underline cursor-none transition-colors duration-[220ms] ${focusRing}`;

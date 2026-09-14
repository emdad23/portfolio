"use client";
import { useSyncExternalStore } from "react";

// Live `matchMedia` result. Reports `false` on the server and during hydration,
// so anything gated on it starts disabled and switches on once the client knows.
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

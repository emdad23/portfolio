"use client";
import { useScrollProgress } from "@/hooks/useScrollProgress";

export function ProgressBar() {
  const progress = useScrollProgress();
  return (
    <div
      className="fixed top-0 left-0 h-[2px] bg-black z-[9999] pointer-events-none transition-none"
      style={{ width: `${progress}%` }}
    />
  );
}

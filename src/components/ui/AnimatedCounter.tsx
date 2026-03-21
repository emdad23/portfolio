"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface Props {
  value: number;
  suffix?: string;
  mode?: "integer" | "float";
}

export function AnimatedCounter({ value, suffix = "", mode = "integer" }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    if (mode === "float") {
      let t = 0;
      const iv = setInterval(() => {
        t += 0.05;
        setDisplay(t.toFixed(1) + suffix);
        if (t >= value) { clearInterval(iv); setDisplay(value.toFixed(1) + suffix); }
      }, 60);
      return () => clearInterval(iv);
    } else {
      let n = 0;
      const step = Math.max(1, Math.floor(1800 / value));
      const iv = setInterval(() => {
        n++;
        setDisplay(n + suffix);
        if (n >= value) { clearInterval(iv); setDisplay(value + suffix); }
      }, step);
      return () => clearInterval(iv);
    }
  }, [inView, value, suffix, mode]);

  return <span ref={ref}>{display}</span>;
}

"use client";
import { useRef, useEffect, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface Props {
  children: ReactNode;
  className?: string;
  /** Fraction of the cursor's distance from centre that the button follows. */
  strength?: number;
  /** Hard cap on the offset, in px, on each axis. */
  max?: number;
}

const clamp = (v: number, max: number) => Math.min(max, Math.max(-max, v));

export function MagneticButton({ children, className, strength = 0.15, max = 6 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  // Desktop affordance only: off for touch/coarse pointers and reduced motion.
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    if (!enabled) reset();
  }, [enabled]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!enabled || e.pointerType === "touch") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    // The rect includes the translation currently rendered; remove it so the
    // centre stays put instead of chasing the cursor.
    const cx = rect.left - springX.get() + rect.width / 2;
    const cy = rect.top - springY.get() + rect.height / 2;
    x.set(clamp((e.clientX - cx) * strength, max));
    y.set(clamp((e.clientY - cy) * strength, max));
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, display: "inline-block" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onMouseLeave={reset}
      className={className}
    >
      {children}
    </motion.div>
  );
}

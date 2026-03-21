"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  words: string[];
  interval?: number;
  className?: string;
}

export function FlipWords({ words, interval = 2500, className }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(iv);
  }, [words.length, interval]);

  return (
    <span className={`relative inline-block overflow-hidden ${className ?? ""}`} style={{ height: "1.08em" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-110%", opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-0 block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

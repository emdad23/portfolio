"use client";
import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ cx: 0, cy: 0, rx: 0, ry: 0 });
  const [hovering, setHovering] = useState(false);
  // Hidden until the first mousemove, so the cursor never parks at (0,0).
  const [visible, setVisible] = useState(false);
  const [onScrim, setOnScrim] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setVisible(true);
      pos.current.cx = e.clientX;
      pos.current.cy = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + "px";
        dotRef.current.style.top = e.clientY + "px";
      }
    };

    const onEnter = (e: MouseEvent) => {
      const t = e.target as Element;
      if (t.closest("a,button,[data-cursor='hover'],.hover-cursor")) setHovering(true);
      // Only the scrim element itself, not content stacked on it (the palette panel).
      setOnScrim(t.matches("[data-cursor-surface='scrim']"));
    };
    const onLeave = (e: MouseEvent) => {
      setHovering(false);
      // No relatedTarget means the pointer left the window.
      if (!e.relatedTarget) setVisible(false);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    let raf: number;
    const loop = () => {
      pos.current.rx += (pos.current.cx - pos.current.rx) * 0.13;
      pos.current.ry += (pos.current.cy - pos.current.ry) * 0.13;
      if (ringRef.current) {
        ringRef.current.style.left = pos.current.rx + "px";
        ringRef.current.style.top = pos.current.ry + "px";
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // White + mix-blend-difference inverts against whatever is underneath, so the
  // cursor reads black on light surfaces and white on dark ones. Both elements
  // must stay direct children of <body> (see layout.tsx): an ancestor with a
  // transform, filter, opacity or isolation would blend against that ancestor
  // alone instead of the page.
  //
  // Difference has one blind spot: mid-gray (127 − 255 = 128). Semi-opaque black
  // scrims like the ⌘K overlay land exactly there, so they opt out with
  // data-cursor-surface="scrim" and the cursor renders as plain white instead.
  const blend = onScrim ? "normal" : undefined;
  return (
    <>
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9998] rounded-full bg-white mix-blend-difference -translate-x-1/2 -translate-y-1/2 transition-[width,height,opacity] duration-200 hidden md2:block"
        style={{
          width: hovering ? 4 : 8,
          height: hovering ? 4 : 8,
          opacity: visible ? 1 : 0,
          mixBlendMode: blend,
        }}
      />
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[9997] rounded-full mix-blend-difference -translate-x-1/2 -translate-y-1/2 transition-[width,height,border-color,opacity] duration-200 hidden md2:block"
        style={{
          width: hovering ? 48 : 34,
          height: hovering ? 48 : 34,
          border: hovering || onScrim ? "1.5px solid rgba(255,255,255,0.7)" : "1.5px solid rgba(255,255,255,0.4)",
          opacity: visible ? 1 : 0,
          mixBlendMode: blend,
        }}
      />
    </>
  );
}

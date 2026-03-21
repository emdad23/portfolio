"use client";
import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ cx: 0, cy: 0, rx: 0, ry: 0 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
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
    };
    const onLeave = () => setHovering(false);

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

  return (
    <>
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9998] rounded-full -translate-x-1/2 -translate-y-1/2 transition-[width,height,background] duration-200 hidden md2:block"
        style={{
          width: hovering ? 4 : 8,
          height: hovering ? 4 : 8,
          background: hovering ? "#2563EB" : "#0A0A0A",
        }}
      />
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[9997] rounded-full -translate-x-1/2 -translate-y-1/2 transition-[width,height,border-color] duration-200 hidden md2:block"
        style={{
          width: hovering ? 48 : 34,
          height: hovering ? 48 : 34,
          border: hovering ? "1.5px solid rgba(37,99,235,0.4)" : "1.5px solid rgba(10,10,10,0.25)",
        }}
      />
    </>
  );
}

"use client";
import { useEffect, useRef } from "react";

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const c = cv.getContext("2d")!;
    let W = 0, H = 0, mx = 0, my = 0, raf = 0;
    const pts: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    const resize = () => {
      W = cv.width = cv.offsetWidth;
      H = cv.height = cv.offsetHeight;
      mx = W / 2; my = H / 2;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 55; i++) {
      pts.push({ x: Math.random() * 2000, y: Math.random() * 900, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.5 + 0.8 });
    }

    const onMove = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    cv.parentElement?.addEventListener("mousemove", onMove);

    const draw = () => {
      c.clearRect(0, 0, W, H);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            c.beginPath();
            c.strokeStyle = `rgba(10,10,10,${(1 - d / 110) * 0.07})`;
            c.lineWidth = 0.6;
            c.moveTo(pts[i].x, pts[i].y);
            c.lineTo(pts[j].x, pts[j].y);
            c.stroke();
          }
        }
        const mdx = pts[i].x - mx, mdy = pts[i].y - my;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 80) { pts[i].vx += (mdx / md) * 0.2; pts[i].vy += (mdy / md) * 0.2; }
        pts[i].vx *= 0.996; pts[i].vy *= 0.996;
        pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
        if (pts[i].x < 0 || pts[i].x > W) pts[i].vx *= -1;
        if (pts[i].y < 0 || pts[i].y > H) pts[i].vy *= -1;
        c.beginPath();
        c.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
        c.fillStyle = "rgba(10,10,10,0.15)";
        c.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      cv.parentElement?.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-35 w-full h-full" />;
}

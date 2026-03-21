"use client";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const stats = [
  { value: 11, suffix: "+", label: "Years Experience" },
  { value: 7, suffix: "", label: "Concurrent Projects" },
  { value: 1, suffix: "M+", label: "Users Reached", mode: "float" as const },
  { value: 4, suffix: "+", label: "Companies Led" },
];

export function Stats() {
  return (
    <div className="py-[70px] px-[5%] bg-gray">
      <div className="grid grid-cols-1 md2:grid-cols-4 gap-px bg-border border border-border rounded-xl overflow-hidden">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 text-center cursor-none group hover:bg-black transition-colors duration-200">
            <div className="text-[clamp(2.2rem,4vw,3.5rem)] font-black tracking-[-2px] leading-none font-mono text-black group-hover:text-white transition-colors duration-200">
              <AnimatedCounter value={s.value} suffix={s.suffix} mode={s.mode ?? "integer"} />
            </div>
            <div className="text-[0.68rem] font-semibold text-muted uppercase tracking-[1.5px] mt-1.5 group-hover:text-white/45 transition-colors duration-200">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { pillars } from "@/data/whatIDo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function WhatIDo() {
  return (
    <section id="what" className="py-[100px] px-[5%] bg-gray">
      <ScrollReveal>
        <p className="text-[0.65rem] font-bold tracking-[3px] uppercase text-muted mb-2">My Value</p>
        <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] font-black tracking-[-1.5px] leading-[1.1] text-black">What I bring to the table.</h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 md2:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden mt-14">
        {pillars.map((p, i) => (
          <ScrollReveal key={i} delay={i * 0.1} className="bg-white p-8 cursor-none group hover:bg-black transition-colors duration-[220ms]">
            <div className="text-base font-bold text-border font-mono mb-5 group-hover:text-white transition-colors duration-[220ms]">{p.num}</div>
            <div className="inline-flex items-center justify-center w-[42px] h-[42px] rounded-lg bg-gray border border-border text-[1.2rem] mb-[0.85rem] group-hover:bg-white/10 group-hover:border-white/10 transition-all duration-[220ms]">{p.icon}</div>
            <h3 className="text-base font-extrabold mb-2 text-black group-hover:text-white transition-colors duration-[220ms]">{p.title}</h3>
            <p className="text-[0.83rem] text-text2 leading-[1.72] group-hover:text-white/60 transition-colors duration-[220ms]">{p.description}</p>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

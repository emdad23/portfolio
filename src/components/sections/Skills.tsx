"use client";
import { skillsRow1, skillsRow2 } from "@/data/skills";

function MarqueeRow({ skills, reverse }: { skills: string[]; reverse?: boolean }) {
  const doubled = [...skills, ...skills];
  return (
    <div className="overflow-hidden mb-[0.65rem]" style={{ WebkitMask: "linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)", mask: "linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)" }}>
      <div className={`flex gap-[0.6rem] w-max py-1 ${reverse ? "animate-[marquee-reverse_20s_linear_infinite]" : "animate-[marquee_26s_linear_infinite]"}`}>
        {doubled.map((skill, i) => (
          <span key={i} className="inline-flex items-center gap-[0.35rem] px-[0.9rem] py-[0.42rem] rounded-[3px] text-[0.75rem] font-semibold border border-border text-text2 bg-white whitespace-nowrap cursor-none transition-all duration-200 hover:bg-black hover:border-black hover:text-white hover:-translate-y-0.5">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Skills() {
  return (
    <section id="skills" className="py-[70px] bg-white overflow-hidden">
      <div className="text-center px-[5%] mb-9">
        <p className="text-[0.65rem] font-bold tracking-[3px] uppercase text-muted mb-2">Stack</p>
        <h2 className="text-[1.6rem] font-black tracking-[-1px] text-black">The right tool for the right job.</h2>
      </div>
      <MarqueeRow skills={skillsRow1} />
      <MarqueeRow skills={skillsRow2} reverse />
    </section>
  );
}

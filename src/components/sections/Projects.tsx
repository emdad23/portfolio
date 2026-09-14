import { projects } from "@/data/projects";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function Projects() {
  return (
    <section id="projects" className="py-[100px] px-[5%] bg-gray">
      <ScrollReveal className="flex items-end justify-between mb-14">
        <div>
          <p className="text-[0.65rem] font-bold tracking-[3px] uppercase text-muted mb-2">Work</p>
          <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] font-black tracking-[-1.5px] leading-[1.1] text-black">Projects that shipped.</h2>
        </div>
        <a href="#contact" className="text-[0.78rem] font-semibold text-muted no-underline cursor-none flex items-center gap-1 hover:text-black transition-colors">View all →</a>
      </ScrollReveal>

      <div className="grid grid-cols-1 md2:grid-cols-2 gap-px bg-border border border-border rounded-xl overflow-hidden">
        {projects.map((p, i) => (
          <ScrollReveal key={p.id} delay={i * 0.05} className="relative bg-white p-8 cursor-none group hover:bg-black transition-colors duration-[220ms] overflow-hidden">
            <div className="absolute bottom-6 right-6 text-[5rem] font-black text-gray-2 leading-none font-mono pointer-events-none group-hover:text-white/[0.08]transition-colors duration-[220ms] z-0">{p.id}</div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[1.6rem]">{p.icon}</span>
                <span className="text-[0.65rem] font-semibold text-muted group-hover:text-white transition-colors duration-[220ms]">{p.badge}</span>
              </div>
              <h3 className="text-[1.05rem] font-extrabold text-black mb-2 group-hover:text-white transition-colors duration-[220ms]">{p.title}</h3>
              <p className="text-[0.83rem] text-text2 leading-[1.72] mb-5 group-hover:text-white/60 transition-colors duration-[220ms]">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.metrics.map((m) => <span key={m} className="text-[0.68rem] font-semibold text-muted group-hover:text-white/50 transition-colors">{m}</span>)}
              </div>
              <div className="flex flex-wrap gap-[0.3rem]">
                {p.tags.map((t) => <span key={t} className="text-[0.62rem] font-semibold px-2 py-0.5 rounded-[3px] bg-gray text-text2 border border-border group-hover:bg-white/[0.08] group-hover:text-white/60 group-hover:border-white/10 transition-all duration-[220ms]">{t}</span>)}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

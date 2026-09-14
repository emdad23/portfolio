import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function ForYou() {
  return (
    <section id="for-you" className="py-[100px] px-[5%] bg-gray">
      <ScrollReveal>
        <p className="text-[0.65rem] font-bold tracking-[3px] uppercase text-muted mb-2">Who This Is For</p>
        <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] font-black tracking-[-1.5px] leading-[1.1] text-black">Two kinds of people,<br/>one open door.</h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 md2:grid-cols-2 gap-5 mt-14">
        {/* Hire card */}
        <ScrollReveal delay={0.1} className="bg-black border border-black rounded-xl p-10 relative overflow-hidden hover:shadow-[6px_6px_0_#333] transition-all">
          <div className="absolute -right-8 -bottom-8 w-[120px] h-[120px] rounded-full bg-white/3 pointer-events-none" />
          <span className="inline-block text-[0.62rem] font-bold tracking-[2px] uppercase px-3 py-1 rounded-[3px] bg-white/10 text-white/60 border border-white/10 mb-5">For Companies & Teams</span>
          <h3 className="text-2xl font-black tracking-[-0.75px] text-white mb-3 leading-[1.22]">You need a leader,<br/>not just a coder.</h3>
          <p className="text-[0.875rem] text-white/55 leading-[1.78] mb-7">Senior engineers who can&apos;t manage people or clients plateau fast. I fill that gap — technical depth, leadership instinct, and business fluency in one hire.</p>
          <ul className="flex flex-col gap-[0.6rem] mb-8 list-none">
            {["Team management — velocity, culture, mentoring","Client communication — trust & expectations","Technical ownership from spec to production","eCommerce, CRM, BPM — 11 years of depth"].map((item) => (
              <li key={item} className="flex items-start gap-[0.6rem] text-[0.83rem] text-white/75">
                <span className="font-black text-white/40 flex-shrink-0">✓</span>{item}
              </li>
            ))}
          </ul>
          <MagneticButton>
            <a href="#contact" data-contact-type="hiring" className="inline-flex items-center gap-2 bg-white text-black px-[1.6rem] py-3 rounded-md font-bold text-[0.875rem] no-underline cursor-none hover:bg-accent hover:text-white transition-all duration-200">Let&apos;s Discuss a Role →</a>
          </MagneticButton>
        </ScrollReveal>

        {/* Junior card */}
        <ScrollReveal delay={0.2} className="bg-white border border-border rounded-xl p-10 relative overflow-hidden hover:border-black hover:shadow-[6px_6px_0_#0A0A0A] transition-all">
          <div className="absolute -right-8 -bottom-8 w-[120px] h-[120px] rounded-full bg-black/3 pointer-events-none" />
          <span className="inline-block text-[0.62rem] font-bold tracking-[2px] uppercase px-3 py-1 rounded-[3px] bg-gray text-muted border border-border mb-5">For Junior Developers</span>
          <h3 className="text-2xl font-black tracking-[-0.75px] text-black mb-3 leading-[1.22]">I remember what it felt<br/>like to be lost.</h3>
          <p className="text-[0.875rem] text-text2 leading-[1.78] mb-7">11 years means I&apos;ve made most of the mistakes already. If you&apos;re early-career and need honest advice on code, career, or growth — just reach out.</p>
          <ul className="flex flex-col gap-[0.6rem] mb-8 list-none">
            {["Career path advice for backend & full-stack devs","Code review and architecture feedback","Junior → Senior (what nobody tells you)","No stupid questions. Seriously."].map((item) => (
              <li key={item} className="flex items-start gap-[0.6rem] text-[0.83rem] text-text2">
                <span className="font-black text-black/40 flex-shrink-0">✓</span>{item}
              </li>
            ))}
          </ul>
          <MagneticButton>
            <a href="#contact" data-contact-type="junior" className="inline-flex items-center gap-2 bg-transparent text-black px-[1.6rem] py-3 rounded-md font-bold text-[0.875rem] no-underline border-[1.5px] border-black cursor-none hover:bg-black hover:text-white transition-all duration-200">Book a Free Chat →</a>
          </MagneticButton>
        </ScrollReveal>
      </div>
    </section>
  );
}

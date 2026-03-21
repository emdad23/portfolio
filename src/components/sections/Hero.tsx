"use client";
import { ParticleCanvas } from "@/components/ui/ParticleCanvas";
import { FlipWords } from "@/components/ui/FlipWords";
import { TiltCard } from "@/components/ui/TiltCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Hero() {
  return (
    <section id="hero" className="min-h-screen pt-[88px] pb-[70px] px-[5%] grid md2:grid-cols-[1.1fr_0.9fr] gap-12 items-center bg-white relative overflow-hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-border">
      <ParticleCanvas />

      {/* Left */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-[0.45rem] bg-[#F0FDF4] text-green border border-[#BBF7D0] px-[0.85rem] py-[0.3rem] rounded-[3px] text-[0.72rem] font-bold mb-6 tracking-[0.3px]">
          <span className="relative w-[6px] h-[6px] rounded-full bg-green flex-shrink-0 before:content-[''] before:absolute before:inset-[-3px] before:rounded-full before:bg-green before:opacity-20 before:animate-ping" />
          Open to opportunities
        </div>

        <p className="text-[0.68rem] font-bold tracking-[3px] uppercase text-muted mb-3">Principal Engineer · Team & Client Leader</p>

        <h1 className="text-[clamp(3rem,5.5vw,5rem)] font-black leading-[1.03] tracking-[-3px] text-black mb-6">
          <span className="block">I lead teams.</span>
          <span className="block" style={{ height: "1.08em", position: "relative", overflow: "hidden" }}>
            <FlipWords
              words={["I own outcomes.", "I build systems.", "I ship products.", "I mentor engineers."]}
              className="font-mono text-accent"
            />
          </span>
        </h1>

        <p className="text-base text-text2 leading-[1.82] max-w-[500px] mb-10">
          With <strong className="text-black font-semibold">11+ years</strong> across eCommerce, CRM, and enterprise automation — my real edge is the teams I build and the clients who trust me to deliver.
        </p>

        <div className="flex gap-[0.875rem] flex-wrap mb-11">
          <MagneticButton>
            <a href="#contact" className="bg-black text-white px-8 py-[0.85rem] rounded-md font-bold text-[0.9rem] no-underline inline-flex items-center gap-2 cursor-none transition-colors duration-[220ms] hover:bg-accent">
              Hire Me →
            </a>
          </MagneticButton>
          <MagneticButton>
            <a href="#contact" className="bg-white text-black px-7 py-[0.85rem] rounded-md font-semibold text-[0.9rem] no-underline border border-border inline-flex items-center gap-2 cursor-none transition-all duration-[220ms] hover:border-black">
              🎓 Junior Dev? Let&apos;s Talk
            </a>
          </MagneticButton>
        </div>

        <div className="flex gap-5 items-center">
          <div className="flex">
            {["R","BS","I","+"].map((l, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-gray border-2 border-white flex items-center justify-center text-[0.62rem] font-extrabold text-black" style={{ marginLeft: i === 0 ? 0 : -6 }}>{l}</div>
            ))}
          </div>
          <p className="text-[0.75rem] text-muted">Worked with <strong className="text-black font-bold">4+ companies</strong> · 500+ LinkedIn connections</p>
        </div>
      </div>

      {/* Right — bento */}
      <div className="hidden md2:block relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <TiltCard className="bg-white border border-border rounded-xl p-5 cursor-none hover:border-black hover:shadow-[4px_4px_0_#0A0A0A] transition-all">
            <div className="text-[2.5rem] font-black tracking-[-2px] leading-none font-mono">11+</div>
            <div className="text-[0.67rem] font-semibold text-muted mt-1 uppercase tracking-[0.8px]">Years Exp.</div>
          </TiltCard>
          <TiltCard className="bg-white border border-border rounded-xl p-5 cursor-none hover:border-black hover:shadow-[4px_4px_0_#0A0A0A] transition-all">
            <div className="text-[2.5rem] font-black tracking-[-2px] leading-none font-mono">1M+</div>
            <div className="text-[0.67rem] font-semibold text-muted mt-1 uppercase tracking-[0.8px]">Users Reached</div>
          </TiltCard>
          <div className="col-span-2 bg-black border border-black rounded-xl p-5 cursor-none hover:shadow-[4px_4px_0_#444] transition-all">
            <div className="flex justify-between items-start mb-[0.85rem]">
              <div>
                <div className="text-[0.85rem] font-bold text-white">Currently Available</div>
                <div className="text-[0.7rem] text-white/50 mt-0.5 leading-snug">Full-time · Consulting · Mentoring</div>
              </div>
              <span className="text-[0.65rem] font-bold px-[0.6rem] py-[0.18rem] rounded-[3px] bg-green/20 text-[#4ADE80]">✓ Open</span>
            </div>
            <div className="flex flex-wrap gap-[0.35rem]">
              {["💼 Full-time","🎓 Mentor","🤝 Consulting"].map(c => (
                <span key={c} className="text-[0.62rem] font-semibold px-[0.52rem] py-[0.17rem] rounded-[3px] bg-white/10 text-white/70 border border-white/10">{c}</span>
              ))}
            </div>
          </div>
          <TiltCard className="bg-white border border-border rounded-xl p-5 cursor-none hover:border-black hover:shadow-[4px_4px_0_#0A0A0A] transition-all">
            <div className="text-[2.5rem] font-black tracking-[-2px] leading-none font-mono">7</div>
            <div className="text-[0.67rem] font-semibold text-muted mt-1 uppercase tracking-[0.8px]">Projects at once</div>
          </TiltCard>
          <TiltCard className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-5 cursor-none hover:shadow-[4px_4px_0_#D97706] transition-all">
            <div className="text-[1.4rem] mb-1">🇧🇩</div>
            <div className="text-[0.78rem] font-bold">Dhaka, BD</div>
            <div className="text-[0.67rem] font-semibold text-muted uppercase tracking-[0.8px] mt-0.5">Remote-ready</div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}

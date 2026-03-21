"use client";
import { useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Contact() {
  const [type, setType] = useState<"hiring" | "junior">("hiring");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-[100px] px-[5%] bg-white">
      <ScrollReveal>
        <p className="text-[0.65rem] font-bold tracking-[3px] uppercase text-muted mb-2">Connect</p>
        <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-1.5px] leading-[1.08] text-black mb-4">Start the <em className="not-italic underline underline-offset-4">conversation.</em></h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 md2:grid-cols-2 gap-20 items-start mt-16">
        {/* Left */}
        <div>
          <p className="text-[0.95rem] text-text2 leading-[1.78] mb-8">Whether you want to talk about a role, a project, or you&apos;re a junior dev who needs 20 minutes of honest advice — reach out. I reply to every message personally.</p>
          <div className="flex flex-col gap-[0.65rem] mb-7">
            {[
              { icon: "✉️", label: "Email", value: "emdad.ullah@reddotdigitalit.com", href: "mailto:emdad.ullah@reddotdigitalit.com" },
              { icon: "📞", label: "Phone / WhatsApp", value: "+880 1833 184053", href: "tel:+8801833184053" },
              { icon: "💼", label: "LinkedIn", value: "linkedin.com/in/emdad-ullah-41956756", href: "https://www.linkedin.com/in/emdad-ullah-41956756/" },
            ].map((opt) => (
              <ScrollReveal key={opt.label}>
                <a href={opt.href} target={opt.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  className="flex items-center gap-4 p-[0.85rem] rounded-lg border border-border bg-white no-underline cursor-none group hover:border-black hover:bg-black transition-all duration-[220ms]">
                  <div className="w-9 h-9 rounded-md flex items-center justify-center text-[0.95rem] bg-gray border border-border flex-shrink-0 group-hover:bg-white/10 group-hover:border-white/10 transition-all duration-[220ms]">{opt.icon}</div>
                  <div>
                    <div className="text-[0.65rem] font-bold text-muted uppercase tracking-[1px] group-hover:text-white/40 transition-colors duration-[220ms]">{opt.label}</div>
                    <div className="text-[0.83rem] font-semibold text-black group-hover:text-white transition-colors duration-[220ms]">{opt.value}</div>
                  </div>
                  <span className="ml-auto text-muted group-hover:text-white transition-colors duration-[220ms]">→</span>
                </a>
              </ScrollReveal>
            ))}
          </div>
          <p className="text-[0.75rem] text-muted">📍 Dhaka, Bangladesh · Available for remote work worldwide</p>
        </div>

        {/* Right — form */}
        <ScrollReveal>
          <div className="bg-gray rounded-xl p-9 border border-border">
            <h3 className="text-[0.95rem] font-extrabold mb-6">Send a message</h3>

            {status === "success" ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-bold text-black">Message sent!</p>
                <p className="text-[0.85rem] text-muted mt-1">I&apos;ll get back to you personally.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Type toggle */}
                <div className="flex gap-2 mb-2">
                  {(["hiring","junior"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setType(t)}
                      className={`flex-1 py-2 rounded-md border text-[0.75rem] font-bold cursor-none transition-all ${type === t ? "border-black bg-black text-white" : "border-border bg-white text-muted hover:border-black"}`}>
                      {t === "hiring" ? "💼 I'm Hiring" : "🎓 I'm a Junior Dev"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.68rem] font-bold text-text2">Name</label>
                    <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Your name" className="px-[0.88rem] py-[0.68rem] rounded-md border border-border bg-white font-sans text-[0.83rem] text-black outline-none focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,.06)] transition-all" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.68rem] font-bold text-text2">Email</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@email.com" className="px-[0.88rem] py-[0.68rem] rounded-md border border-border bg-white font-sans text-[0.83rem] text-black outline-none focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,.06)] transition-all" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.68rem] font-bold text-text2">Subject</label>
                  <input required value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="What's on your mind?" className="px-[0.88rem] py-[0.68rem] rounded-md border border-border bg-white font-sans text-[0.83rem] text-black outline-none focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,.06)] transition-all" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.68rem] font-bold text-text2">Message</label>
                  <textarea required value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="Tell me about the opportunity, challenge, or just say hi..." className="px-[0.88rem] py-[0.68rem] rounded-md border border-border bg-white font-sans text-[0.83rem] text-black outline-none focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,.06)] resize-y min-h-[100px] transition-all" />
                </div>

                {status === "error" && <p className="text-[0.8rem] text-red-500">Something went wrong. Please try again.</p>}

                <MagneticButton className="w-full">
                  <button type="submit" disabled={status === "loading"} className="w-full bg-black text-white py-[0.85rem] rounded-md font-bold text-[0.875rem] cursor-none hover:bg-accent transition-colors duration-[220ms] disabled:opacity-60">
                    {status === "loading" ? "Sending..." : "Send Message →"}
                  </button>
                </MagneticButton>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

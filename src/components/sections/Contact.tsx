"use client";
import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { CONTACT_TYPES, CONTACT_TYPE_EVENT, isContactType, type ContactType } from "@/lib/contactType";

type Field = "name" | "email" | "subject" | "message";

export function Contact() {
  const [type, setType] = useState<ContactType>("hiring");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const typeButtons = useRef<Partial<Record<ContactType, HTMLButtonElement | null>>>({});

  // Preselect a track from CTAs elsewhere on the page. See @/lib/contactType.
  useEffect(() => {
    const select = (next: ContactType) => {
      setType(next);
      // Park focus on the chosen tab so keyboard and screen-reader users land
      // in the form. Deferred until the hash jump has run; preventScroll so it
      // doesn't fight the smooth scroll (and no input grabs focus, which would
      // pop the on-screen keyboard on touch).
      setTimeout(() => typeButtons.current[next]?.focus({ preventScroll: true }), 0);
    };

    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as Element | null)?.closest<HTMLElement>("[data-contact-type]");
      const next = trigger?.dataset.contactType;
      if (isContactType(next)) select(next);
    };
    const onRequest = (e: Event) => {
      const next = (e as CustomEvent<unknown>).detail;
      if (isContactType(next)) select(next);
    };

    const fromQuery = new URLSearchParams(window.location.search).get("type");
    if (isContactType(fromQuery)) setType(fromQuery);

    document.addEventListener("click", onClick);
    window.addEventListener(CONTACT_TYPE_EVENT, onRequest);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener(CONTACT_TYPE_EVENT, onRequest);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type }),
      });

      if (!res.ok) {
        // A 400 carries Zod's per-field messages — show them on the fields
        // instead of the generic failure notice.
        const body = await res.json().catch(() => null);
        const fieldErrors: Record<string, string[]> = body?.details?.fieldErrors ?? {};
        const mapped = Object.fromEntries(
          Object.entries(fieldErrors)
            .filter(([, messages]) => messages?.length)
            .map(([field, messages]) => [field, messages[0]])
        ) as Partial<Record<Field, string>>;
        setErrors(mapped);
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  // Mirrors contactSchema in @/lib/validations — keep the two in sync.
  const limits = {
    name: { minLength: 2, maxLength: 100 },
    subject: { minLength: 3, maxLength: 200 },
    message: { minLength: 10, maxLength: 5000 },
  } as const;

  const fieldClass = (field: Field) =>
    `px-[0.88rem] py-[0.68rem] rounded-md border bg-white font-sans text-[0.83rem] text-black outline-none focus:shadow-[0_0_0_3px_rgba(0,0,0,.06)] transition-all ${
      errors[field] ? "border-red-500 focus:border-red-500" : "border-border focus:border-black"
    }`;

  const FieldError = ({ field }: { field: Field }) =>
    errors[field] ? (
      <p id={`${field}-error`} className="text-[0.7rem] text-red-500">
        {errors[field]}
      </p>
    ) : null;

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
                <div role="group" aria-label="I'm reaching out as" className="flex gap-2 mb-2">
                  {CONTACT_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setType(t)} aria-pressed={type === t}
                      ref={(el) => { typeButtons.current[t] = el; }}
                      className={`flex-1 py-2 rounded-md border text-[0.75rem] font-bold cursor-none transition-all outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${type === t ? "border-black bg-black text-white" : "border-border bg-white text-muted hover:border-black"}`}>
                      {t === "hiring" ? "💼 I'm Hiring" : "🎓 I'm a Junior Dev"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="contact-name" className="text-[0.68rem] font-bold text-text2">Name</label>
                    <input id="contact-name" required {...limits.name} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Your name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} className={fieldClass("name")} />
                    <FieldError field="name" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="contact-email" className="text-[0.68rem] font-bold text-text2">Email</label>
                    <input id="contact-email" required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@email.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} className={fieldClass("email")} />
                    <FieldError field="email" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="contact-subject" className="text-[0.68rem] font-bold text-text2">Subject</label>
                  <input id="contact-subject" required {...limits.subject} value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="What's on your mind?" aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "subject-error" : undefined} className={fieldClass("subject")} />
                  <FieldError field="subject" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="contact-message" className="text-[0.68rem] font-bold text-text2">Message</label>
                  <textarea id="contact-message" required {...limits.message} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="Tell me about the opportunity, challenge, or just say hi..." aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} className={`${fieldClass("message")} resize-y min-h-[100px]`} />
                  <FieldError field="message" />
                </div>

                {status === "error" && (
                  <p className="text-[0.8rem] text-red-500">
                    {Object.keys(errors).length > 0
                      ? "Please fix the highlighted fields and try again."
                      : "Something went wrong. Please try again."}
                  </p>
                )}

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

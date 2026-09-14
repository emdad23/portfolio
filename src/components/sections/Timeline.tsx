"use client";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { TimelineEntry } from "@/lib/experience";

// Anchor for one entry, targeted by the Jump-to list. Prefixed so it can't
// collide with the section ids in src/data/nav.ts.
const entryAnchor = (id: string) => `experience-${id}`;

// Entries come from the Experience table, newest first (see getTimeline).
export function Timeline({ entries, yearsOfExperience }: { entries: TimelineEntry[]; yearsOfExperience: number }) {
  return (
    <section id="timeline" className="py-[110px] px-[5%] bg-white">
      <ScrollReveal>
        <p className="text-[0.65rem] font-bold tracking-[3px] uppercase text-muted mb-2">Career</p>
        <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] font-black tracking-[-1.5px] leading-[1.1] text-black">A story built over {yearsOfExperience}+ years.</h2>
      </ScrollReveal>

      <div className="grid md2:grid-cols-[200px_1fr] gap-16 mt-16 items-start">
        {/* Legend */}
        <div className="hidden md2:block sticky top-20">
          <p className="text-[0.62rem] font-bold tracking-[2.5px] uppercase text-muted mb-5">Jump to</p>
          {entries.map(({ id, yearRange: year }) => (
            <a key={id} href={`#${entryAnchor(id)}`} className="flex items-center gap-[0.65rem] px-[0.7rem] py-2 rounded-md cursor-none no-underline transition-colors hover:bg-gray mb-0.5 group">
              <span className="w-[6px] h-[6px] rounded-full bg-border flex-shrink-0 group-hover:bg-black transition-colors" />
              <span className="text-[0.75rem] font-semibold text-muted group-hover:text-black transition-colors">{year}</span>
            </a>
          ))}
        </div>

        {/* Entries */}
        <div className="relative pl-7 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-5 before:w-px before:bg-border">
          {entries.map((entry, i) => (
            // scroll-mt clears the fixed 62px nav when a Jump-to link lands here.
            <ScrollReveal key={entry.id} id={entryAnchor(entry.id)} delay={i * 0.05} className="relative mb-14 group scroll-mt-24">
              <span className="absolute -left-[1.9rem] top-[7px] w-[10px] h-[10px] rounded-full bg-white border-[1.5px] border-border group-hover:border-black group-hover:bg-black transition-all" />
              <div className="flex items-start justify-between gap-4 mb-1.5 flex-wrap">
                <div>
                  <div className="text-[1.05rem] font-extrabold text-black">{entry.role}</div>
                  <div className="text-[0.83rem] text-muted font-medium mt-0.5">
                    {entry.companyLink ? (
                      <a href={entry.companyLink} target="_blank" rel="noopener noreferrer" className="text-inherit no-underline border-b border-border hover:text-black hover:border-black transition-all cursor-none">{entry.company}</a>
                    ) : entry.company}
                  </div>
                </div>
                <span className="text-[0.67rem] font-semibold font-mono text-muted bg-gray px-[0.65rem] py-[0.2rem] rounded-[3px] border border-border whitespace-nowrap">{entry.period}</span>
              </div>

              <p className="text-[0.875rem] text-text2 leading-[1.78] mb-5">{entry.description}</p>

              {entry.metrics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {entry.metrics.map((m, mi) => (
                    <span key={mi} className={`text-[0.72rem] font-semibold px-[0.7rem] py-[0.25rem] rounded-[3px] border ${m.type === "green" ? "bg-[#F0FDF4] text-green border-[#BBF7D0]" : m.type === "amber" ? "bg-[#FFFBEB] text-amber border-[#FDE68A]" : "bg-gray text-black border-border"}`}>{m.label}</span>
                  ))}
                </div>
              )}

              {entry.projects.length > 0 && (
                <div className="flex flex-wrap gap-[0.6rem]">
                  {entry.projects.map((p, pi) => (
                    <div key={pi} className="border border-border rounded-lg px-[0.85rem] py-[0.6rem] cursor-none hover:border-black hover:shadow-[2px_2px_0_#0A0A0A] transition-all bg-white">
                      <div className="text-[0.8rem] font-bold text-black mb-1">{p.name}</div>
                      <div className="flex flex-wrap gap-1">
                        {p.tags.map((t) => <span key={t} className="text-[0.6rem] font-semibold px-[0.4rem] py-[0.1rem] rounded-[3px] bg-gray text-text2 border border-border">{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

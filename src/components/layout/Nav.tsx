"use client";
import Link from "next/link";
import { navLinks } from "@/data/nav";
import { useActiveSection } from "@/hooks/useActiveSection";
import { MagneticButton } from "@/components/ui/MagneticButton";

interface Props {
  onOpenPalette: () => void;
}

export function Nav({ onOpenPalette }: Props) {
  const active = useActiveSection(["hero","timeline","what","skills","projects","blog","for-you","contact"]);

  return (
    <nav className="fixed top-[2px] left-0 right-0 z-[800] h-[60px] flex items-center justify-between px-[5%] bg-white/92 backdrop-blur-[20px] border-b border-border">
      <Link href="/" className="font-black text-[1.05rem] tracking-[-0.5px] text-black no-underline cursor-none">
        emdad<span className="border-b-2 border-black">.</span>dev
      </Link>

      <ul className="hidden md2:flex gap-7 list-none">
        {navLinks.map((link) => {
          const id = link.href.replace("#", "");
          return (
            <li key={link.href}>
              <a href={link.href}
                className={`relative text-[0.82rem] font-medium no-underline cursor-none transition-colors duration-200 after:content-[''] after:absolute after:bottom-[-3px] after:left-0 after:right-0 after:h-[1.5px] after:bg-black after:transition-transform after:duration-[220ms] after:origin-left ${active === id ? "text-black after:scale-x-100" : "text-muted after:scale-x-0 hover:text-black hover:after:scale-x-100"}`}>
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="flex gap-[0.6rem] items-center">
        <MagneticButton>
          <button onClick={onOpenPalette}
            className="hidden md2:flex items-center gap-2 text-[0.75rem] font-medium text-muted px-[0.85rem] py-[0.35rem] border border-border rounded-md cursor-none transition-all duration-200 bg-white hover:border-black hover:text-black">
            Search <kbd className="font-mono text-[0.6rem] bg-gray px-[0.35rem] py-[0.1rem] rounded border border-border">⌘K</kbd>
          </button>
        </MagneticButton>
        <MagneticButton>
          <a href="#contact" data-contact-type="hiring" className="text-[0.82rem] font-bold text-white bg-black px-[1.1rem] py-[0.42rem] rounded-md no-underline cursor-none transition-all duration-[220ms] hover:bg-black-3 hover:shadow-[2px_2px_0_#444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
            Hire Me →
          </a>
        </MagneticButton>
      </div>
    </nav>
  );
}

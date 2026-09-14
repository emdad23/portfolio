import type { ContactType } from "@/lib/contactType";

export interface NavLink {
  label: string;
  href: string;
}

export interface CommandItem {
  emoji: string;
  label: string;
  href: string;
  shortcut: string;
  external?: boolean;
  /** Preselects this contact-form track when the item jumps to #contact. */
  contactType?: ContactType;
}

export interface CommandGroup {
  label: string;
  items: CommandItem[];
}

export const navLinks: NavLink[] = [
  { label: "Experience", href: "#timeline" },
  { label: "What I Do", href: "#what" },
  { label: "Projects", href: "#projects" },
  { label: "Blog", href: "#blog" },
  { label: "For You", href: "#for-you" },
  { label: "Contact", href: "#contact" },
];

export const commandGroups: CommandGroup[] = [
  {
    label: "Navigate",
    items: [
      { emoji: "🏠", label: "Home", href: "#hero", shortcut: "G H" },
      { emoji: "📅", label: "Experience Timeline", href: "#timeline", shortcut: "G E" },
      { emoji: "🧭", label: "What I Do", href: "#what", shortcut: "G W" },
      { emoji: "🚀", label: "Featured Projects", href: "#projects", shortcut: "G P" },
      { emoji: "✍️", label: "Blog & Writing", href: "#blog", shortcut: "G B" },
      { emoji: "🤝", label: "For Companies & Juniors", href: "#for-you", shortcut: "G F" },
      { emoji: "📧", label: "Contact", href: "#contact", shortcut: "G C" },
    ],
  },
  {
    label: "Quick Actions",
    items: [
      { emoji: "✉️", label: "Send Email", href: "mailto:emdad.ullah@reddotdigitalit.com", shortcut: "⌘ E" },
      { emoji: "💼", label: "Open LinkedIn", href: "https://www.linkedin.com/in/emdad-ullah-41956756/", shortcut: "⌘ L", external: true },
      { emoji: "📞", label: "WhatsApp / Call", href: "tel:+8801833184053", shortcut: "⌘ P" },
      { emoji: "🎓", label: "Book Mentorship Chat", href: "#contact", shortcut: "⌘ M", contactType: "junior" },
    ],
  },
];

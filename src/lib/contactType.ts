// The contact form's two audience tracks. Kept free of zod so client
// components can import it without pulling the validator into the bundle.
export const CONTACT_TYPES = ["hiring", "junior"] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];

export const isContactType = (value: unknown): value is ContactType =>
  typeof value === "string" && (CONTACT_TYPES as readonly string[]).includes(value);

// CTAs outside the contact section preselect a track in one of two ways:
//  - links carry `data-contact-type="hiring" | "junior"` (works from server components)
//  - programmatic navigation (the ⌘K palette) calls `requestContactType()`
// A `?type=junior` query param on load does the same for cross-page links.
export const CONTACT_TYPE_EVENT = "contact:select-type";

export function requestContactType(type: ContactType) {
  window.dispatchEvent(new CustomEvent<ContactType>(CONTACT_TYPE_EVENT, { detail: type }));
}

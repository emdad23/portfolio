"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinkClass } from "@/components/admin/styles";

// Hrefs are built on the server (adminHref) and compared against the browser
// URL, which is the public /<ADMIN_PATH>/… path, not the internal /admin one.
export function AdminNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const home = links[0]?.href;

  return (
    <nav aria-label="Admin" className="order-last w-full md2:order-none md2:w-auto">
      <ul className="flex flex-wrap gap-1 -mx-3 md2:mx-0">
        {links.map(({ href, label }) => {
          const active = href === home ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${navLinkClass} ${active ? "text-black underline underline-offset-[0.4em] decoration-2" : "text-muted hover:text-black"}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

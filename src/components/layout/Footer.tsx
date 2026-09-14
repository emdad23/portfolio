import Link from "next/link";

export function Footer({ location }: { location: string }) {
  return (
    <footer className="bg-black px-[5%] py-8 flex justify-between items-center flex-wrap gap-4">
      <p className="text-[0.75rem] text-white/35">
        © 2024 <strong className="text-white/70">Kazi Md Emdad Ullah</strong> · Principal Software Developer · {location}
      </p>
      <div className="flex">
        {[["Top ↑","#hero"],["Experience","#timeline"],["Blog","/blog"],["Contact","#contact"]].map(([label, href]) => (
          <Link key={href} href={href} className="text-[0.75rem] text-white/35 no-underline cursor-none transition-colors duration-200 hover:text-white/80 ml-6">
            {label}
          </Link>
        ))}
      </div>
    </footer>
  );
}

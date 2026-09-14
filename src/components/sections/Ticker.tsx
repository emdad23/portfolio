export function Ticker({ yearsOfExperience }: { yearsOfExperience: number }) {
  const items = ["Principal Engineer","Team Leadership","Client Management",`${yearsOfExperience}+ Years`,"eCommerce at Scale","Agile Delivery","7 Projects Managed","Open to Mentoring"];
  const row = (
    <>
      {[...items,...items].map((item, i) => (
        <span key={i} className="inline-flex items-center gap-[2.5rem]">
          <span className="text-[0.72rem] font-semibold text-white/70 tracking-[0.5px] whitespace-nowrap">{item}</span>
          <span className="text-white/20">·</span>
        </span>
      ))}
    </>
  );

  return (
    <div className="bg-black overflow-hidden py-[0.55rem]">
      <div className="flex gap-[2.5rem] w-max animate-[ticker_28s_linear_infinite] whitespace-nowrap">{row}</div>
    </div>
  );
}

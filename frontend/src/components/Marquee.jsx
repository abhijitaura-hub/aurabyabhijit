const WORDS = [
  "Artificial Intelligence",
  "Automation",
  "Cybersecurity",
  "Cloud Architecture",
  "Digital Transformation",
  "Technology Leadership",
];

export default function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div
      className="relative overflow-hidden border-y border-white/8 bg-[#0c0c0f] py-5 select-none"
      aria-hidden="true"
      data-testid="editorial-marquee"
    >
      <div className="marquee-track flex w-max items-center whitespace-nowrap">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center">
            {row.map((w, i) => (
              <span key={`${half}-${i}`} className="flex items-center">
                <span className="font-display text-lg md:text-xl font-light tracking-[0.18em] uppercase text-zinc-500">
                  {w}
                </span>
                <span className="mx-10 h-1.5 w-1.5 rounded-full bg-cyan-electric/60" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const STATS: { label: string; value: string | string[] }[] = [
  { label: "Founded", value: "1989" },
  { label: "Active members", value: "40+" },
  { label: "Rehearsals", value: ["Mon-Fri 16:00-21:00", "Sat-Sun 13:00-18:00"] },
  { label: "Shows / year", value: "4–6" },
];

const CONTACT = [
  { label: "Instagram", href: "https://www.instagram.com/kuacoustic_official/" },
  { label: "Tiktok", href: "https://www.tiktok.com/@kuacousticofficial" },
  { label: "Youtube", href: "https://www.youtube.com/@kuacoustic" },
];

export default function About() {
  return (
    <section id="about" className="px-6 md:px-10 py-24 md:py-32 border-t border-foreground/15">
      <div className="max-w-6xl mx-auto">
        <span className="font-mono text-xs text-foreground/40">03</span>
        <h2 className="font-display text-4xl md:text-5xl mt-2 mb-14">About</h2>

        <div className="grid md:grid-cols-2 gap-14 md:gap-10">
          <p className="font-display italic text-2xl md:text-[2rem] leading-[1.35]">
            A campus music club for anyone who loves to play music, sing, and perform. 
            We welcome all students from any faculty to join us and share their passion for music.
          </p>

          <div className="flex flex-col gap-12">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 font-mono text-sm">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="text-foreground/45 text-[10px] tracking-widest uppercase mb-1">
                    {s.label}
                  </dt>
                  <dd className="text-lg font-body leading-snug">
                    {Array.isArray(s.value) ? (
                      s.value.map((line) => <div key={line}>{line}</div>)
                    ) : (
                      s.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col border-t border-foreground/15">
              {CONTACT.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="flex items-center justify-between py-4 border-b border-foreground/15 font-body hover:pl-2 transition-[padding] duration-200"
                >
                  {c.label}
                  <span className="font-mono text-foreground/40">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const STATS = [
  { label: "Founded", value: "2019" },
  { label: "Active members", value: "40+" },
  { label: "Rehearsals", value: "Tue & Thu" },
  { label: "Shows / year", value: "4–6" },
];

const CONTACT = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Line Open Chat", href: "#" },
  { label: "Email", href: "mailto:hello@kuacoustic.club" },
];

export default function About() {
  return (
    <section id="about" className="px-6 md:px-10 py-24 md:py-32 border-t border-foreground/15">
      <div className="max-w-6xl mx-auto">
        <span className="font-mono text-xs text-foreground/40">03</span>
        <h2 className="font-display text-4xl md:text-5xl mt-2 mb-14">About</h2>

        <div className="grid md:grid-cols-2 gap-14 md:gap-10">
          <p className="font-display italic text-2xl md:text-[2rem] leading-[1.35]">
            We're a group of students who'd rather sit in a circle with a guitar than
            watch one on a screen. No auditions, no grades — just songs, borrowed
            harmonies, and a room every Tuesday and Thursday.
          </p>

          <div className="flex flex-col gap-12">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 font-mono text-sm">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="text-foreground/45 text-[10px] tracking-widest uppercase mb-1">
                    {s.label}
                  </dt>
                  <dd className="text-lg font-body">{s.value}</dd>
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

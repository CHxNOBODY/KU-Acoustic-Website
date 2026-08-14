import { useState } from "react";
import { shows } from "@/data/content";
import { ArrowUpRight } from "lucide-react";

export default function Shows() {
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const list = shows.filter((s) => s.status === filter);

  return (
    <section id="shows" className="px-6 md:px-10 py-24 md:py-32 border-t border-foreground/15">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="font-mono text-xs text-foreground/40">01</span>
            <h2 className="font-display text-4xl md:text-5xl mt-2">Shows</h2>
          </div>

          <div className="flex font-mono text-xs tracking-widest uppercase">
            {(["upcoming", "past"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 border transition-colors ${
                  filter === f
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground/25 text-foreground/60 hover:text-foreground hover:border-foreground/60"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-foreground/15">
          {list.map((show) => {
            const Wrapper = show.link ? "a" : "div";

            return (
              <Wrapper
                key={show.id}
                {...(show.link
                  ? { href: show.link, target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`group grid grid-cols-[auto_1px_1fr_auto] md:grid-cols-[6rem_1px_1fr_auto_auto] items-center gap-x-5 md:gap-x-8 py-6 border-b border-foreground/15 transition-colors hover:bg-foreground hover:text-background px-2 -mx-2 ${
                  show.link ? "cursor-pointer" : ""
                }`}
              >
                <div className="font-mono leading-none">
                  <div className="text-3xl md:text-4xl">{show.day}</div>
                  <div className="text-[10px] tracking-widest text-foreground/50 group-hover:text-background/60 mt-1">
                    {show.month} {show.year}
                  </div>
                </div>

                <div
                  className="self-stretch w-px bg-foreground/20 group-hover:bg-background/25"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, currentColor 0 4px, transparent 4px 9px)",
                  }}
                />

                <div className="min-w-0">
                  <h3 className="font-display text-xl md:text-2xl truncate">{show.title}</h3>
                  <p className="font-body text-sm text-foreground/60 group-hover:text-background/70 mt-1">
                    {show.venue} · {show.time}
                  </p>
                </div>

                <div className="hidden md:block font-mono text-[10px] tracking-widest uppercase text-foreground/50 group-hover:text-background/60">
                  {show.tag}
                </div>

                {show.link && (
                  <ArrowUpRight
                    size={18}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                )}
              </Wrapper>
            );
          })}

          {list.length === 0 && (
            <p className="py-16 text-center font-body text-foreground/50">
              Nothing here yet — check back soon.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

import { news } from "@/data/content";

export default function News() {
  return (
    <section id="news" className="px-6 md:px-10 py-24 md:py-32 border-t border-foreground/15">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <span className="font-mono text-xs text-foreground/40">02</span>
          <h2 className="font-display text-4xl md:text-5xl mt-2">News</h2>
        </div>

        <div className="border-t border-foreground/15">
          {news.map((item) => (
            <article
              key={item.id}
              className="group grid grid-cols-1 md:grid-cols-[8rem_1fr] gap-x-8 gap-y-2 py-8 border-b border-foreground/15"
            >
              <div className="font-mono text-[11px] tracking-widest text-foreground/45 pt-1">
                {item.date}
              </div>

              <div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-foreground/40">
                  {item.category}
                </span>
                <h3 className="font-display text-2xl md:text-[1.75rem] mt-1 leading-snug">
                  <span className="bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-[length:0%_1px] bg-[position:0_100%] group-hover:bg-[length:100%_1px] transition-[background-size] duration-300 ease-out pb-0.5">
                    {item.title}
                  </span>
                </h3>
                <p className="font-body text-foreground/60 mt-2 max-w-2xl">{item.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

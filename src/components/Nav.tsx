import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { n: "01", label: "Shows", href: "#shows" },
  { n: "02", label: "News", href: "#news" },
  { n: "03", label: "About", href: "#about" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur border-b border-foreground/15" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <a href="#top" className="font-display text-lg tracking-tight leading-none">
          KU <span className="italic">Acoustic</span>
        </a>

        <nav className="hidden md:flex items-center gap-10 font-mono text-[11px] tracking-widest uppercase">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              <span className="text-foreground/40 group-hover:text-foreground transition-colors">
                {l.n}
              </span>
              {l.label}
            </a>
          ))}
        </nav>

        <button
          className="md:hidden p-1"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-foreground/15 bg-background px-6 py-6 flex flex-col gap-5 font-mono text-xs tracking-widest uppercase">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 text-foreground/80"
            >
              <span className="text-foreground/40">{l.n}</span>
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

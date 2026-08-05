import Waveform from "./Waveform";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] flex flex-col justify-center px-6 md:px-10 pt-16"
    >
      <div className="max-w-6xl mx-auto w-full">
        <p className="font-mono text-[11px] md:text-xs tracking-[0.25em] uppercase text-foreground/50 mb-6">
          Est. 2019 — Strings, voices, no plugs
        </p>

        <h1 className="font-display leading-[0.92] tracking-tight text-[15vw] md:text-[8.5vw] lg:text-[7.2rem]">
          KU
          <br />
          <span className="italic">Acoustic</span>
        </h1>

        <div className="mt-10 md:mt-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <p className="font-body text-base md:text-lg text-foreground/70 max-w-md">
            A campus music club for anyone who'd rather play the song than plug it in.
            Weekly sessions, open mics, and a handful of proper shows each year.
          </p>

          <Waveform className="md:justify-end" height={56} />
        </div>
      </div>

      <a
        href="#shows"
        className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-foreground/50 hover:text-foreground transition-colors"
      >
        Scroll
        <span className="w-px h-10 bg-foreground/30" />
      </a>
    </section>
  );
}

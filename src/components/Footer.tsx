import Waveform from "./Waveform";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background px-6 md:px-10 py-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <p className="font-display italic text-3xl md:text-4xl">KU Acoustic</p>
          <p className="font-mono text-[11px] tracking-widest uppercase text-background/50 mt-3">
            Every Tuesday &amp; Thursday · Activity Building
          </p>
        </div>

        <Waveform height={34} barClassName="bg-background" />

        <p className="font-mono text-[10px] tracking-widest uppercase text-background/40">
          © {new Date().getFullYear()} KU Acoustic Club
        </p>
      </div>
    </footer>
  );
}

const HEIGHTS = [
  18, 34, 12, 45, 24, 60, 30, 15, 48, 22, 38, 10, 52, 28, 16, 42, 20, 58, 26,
  14, 36, 46, 18, 32, 12, 44, 24, 56, 30, 16, 40, 20, 50, 28, 14, 34, 22, 48,
  18, 38,
];

export default function Waveform({
  className = "",
  barClassName = "",
  height = 60,
  animate = true,
}: {
  className?: string;
  barClassName?: string;
  height?: number;
  animate?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-[3px] ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      {HEIGHTS.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] bg-foreground origin-center shrink-0 ${
            animate ? "animate-wave" : ""
          } ${barClassName}`}
          style={{
            height: `${(h / 60) * height}px`,
            animationDelay: `${(i % 12) * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}

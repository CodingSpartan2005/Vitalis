type MarqueeProps = {
  items: string[];
  className?: string;
  slow?: boolean;
  separator?: string;
};

export default function Marquee({ items, className = "", slow = false, separator = "✦" }: MarqueeProps) {
  const loop = [...items, ...items];
  return (
    <div className={`marquee-mask overflow-hidden ${className}`}>
      <div className={`marquee-track ${slow ? "marquee-track-slow" : ""} items-center gap-10`}>
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-10">
            <span className="whitespace-nowrap">{item}</span>
            <span className="text-fuchsia-400/70">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const SIZES = {
  xs: { mark: 30, text: "text-[19px]" },
  sm: { mark: 40, text: "text-[22px]" },
  md: { mark: 46, text: "text-[26px]" },
};

type Props = {
  size?: keyof typeof SIZES;
  tagline?: string;
  className?: string;
};

// Gear + excavator arm mark, "Machinze" wordmark
export default function Logo({ size = "md", tagline, className }: Props) {
  const { mark, text } = SIZES[size];
  const teeth = Array.from({ length: 10 }, (_, i) => i * 36);

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <svg width={mark} height={mark} viewBox="0 0 48 48" aria-hidden>
        <defs>
          <linearGradient id="logo-amber" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffc247" />
            <stop offset="1" stopColor="#e8930c" />
          </linearGradient>
        </defs>
        {/* gear */}
        <g className="fx-gear" fill="#111c4e">
          {teeth.map((deg) => (
            <rect key={deg} x="21" y="2" width="6" height="8" rx="1.5" transform={`rotate(${deg} 24 24)`} />
          ))}
          <circle cx="24" cy="24" r="16" />
        </g>
        <circle cx="24" cy="24" r="11" fill="#fff" />
        {/* excavator arm breaking out of the gear */}
        <path
          d="M14 33h14l2-5h-7l-1-4 9-9 6 4 5 7-3 3-3-4-4-2-5 5 1 3h4l2 2v3H14z"
          fill="url(#logo-amber)"
        />
        <path d="M40 30.5l3.5 5.5h-6z" fill="#e8930c" />
        <rect x="13" y="33.5" width="18" height="4" rx="2" fill="#111c4e" />
      </svg>
      <span className="flex flex-col gap-1">
        <span className={`${text} font-extrabold tracking-tight leading-none`}>
          <span className="text-navy-900">Machin</span>
          <span className="bg-gradient-to-br from-[#ffbe3d] to-[#e8930c] bg-clip-text text-transparent">ze</span>
        </span>
        {tagline && <span className="text-[11px] font-medium tracking-wide text-slate-500">{tagline}</span>}
      </span>
    </div>
  );
}

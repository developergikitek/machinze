import "./ExcavatorScene.css";

function Pin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="4.2" fill="#262a31" />
      <circle cx={x} cy={y} r="1.6" fill="#a2a9b3" />
    </g>
  );
}

// Hero illustration: excavator digging in front of a faded construction skyline.
// Arm parts are nested (boom > stick > bucket) so each rotates around its own pin.
export default function ExcavatorScene({ className }: { className?: string }) {
  const rollers = [52, 80, 108, 136, 164];
  const bucketTeeth = [234, 242, 250, 258];

  return (
    <svg viewBox="0 0 300 220" className={className} role="img" aria-label="Excavator digging">
      <defs>
        <linearGradient id="ex-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffcb45" />
          <stop offset="1" stopColor="#e8940c" />
        </linearGradient>
        <linearGradient id="ex-boom" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd25c" />
          <stop offset="1" stopColor="#e18a08" />
        </linearGradient>
        <linearGradient id="ex-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f5a80" />
          <stop offset="1" stopColor="#14213a" />
        </linearGradient>
        <linearGradient id="ex-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a505a" />
          <stop offset="1" stopColor="#23272e" />
        </linearGradient>
        <linearGradient id="ex-chrome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#eef1f5" />
          <stop offset="1" stopColor="#9aa3ae" />
        </linearGradient>
        <linearGradient id="ex-dirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9bf93" />
          <stop offset="1" stopColor="#a8875a" />
        </linearGradient>
        <radialGradient id="ex-glow" cx="0.5" cy="0.6" r="0.6">
          <stop offset="0" stopColor="#ffb52e" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffb52e" stopOpacity="0" />
        </radialGradient>
        <clipPath id="ex-window">
          <path d="M114 114V81q0-5 5-5h20q3 0 4 3l9 35z" />
        </clipPath>
        <filter id="ex-blur" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="ex-soft">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id="ex-dust">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* skyline */}
      <g fill="#64748b" opacity="0.1">
        <rect x="8" y="112" width="26" height="84" />
        <rect x="38" y="90" width="20" height="106" />
        <rect x="186" y="98" width="30" height="98" />
        <rect x="220" y="122" width="22" height="74" />
        <rect x="248" y="104" width="28" height="92" />
      </g>
      <g stroke="#94a3b8" strokeWidth="1.2" fill="none" opacity="0.45">
        {/* tower crane */}
        <path d="M86 196V22M94 196V22" />
        <path d="M86 40l8 12M94 52l-8 12M86 64l8 12M94 76l-8 12M86 88l8 12M94 100l-8 12" />
        <path d="M20 22h196M20 30h196M90 22V8" />
        <path d="M30 22l8 8M46 22l8 8M62 22l8 8M106 22l8 8M122 22l8 8M138 22l8 8M154 22l8 8M170 22l8 8M186 22l8 8" />
        <path d="M90 8L30 22M90 8l120 14" />
        <g className="ex-hook">
          <path d="M168 30v40" />
          <path d="M164 70h8v6h-8z" />
        </g>
        {/* second crane, far */}
        <g opacity="0.6">
          <path d="M262 196V60M268 196V60M236 62h56M266 60V50M266 50l-28 12M266 50l24 12" />
        </g>
      </g>

      <ellipse cx="140" cy="140" rx="140" ry="70" fill="url(#ex-glow)" />

      {/* ground shadow + dust */}
      <ellipse cx="150" cy="200" rx="128" ry="7" fill="#0f172a" opacity="0.22" filter="url(#ex-blur)" />
      <g fill="#fff" opacity="0.7" filter="url(#ex-dust)">
        <ellipse cx="40" cy="196" rx="30" ry="8" />
        <ellipse cx="200" cy="198" rx="40" ry="7" />
      </g>

      {/* exhaust smoke */}
      <g fill="#94a3b8" filter="url(#ex-soft)">
        <circle className="ex-smoke" cx="66" cy="100" r="5" />
        <circle className="ex-smoke" cx="66" cy="100" r="5" />
        <circle className="ex-smoke" cx="66" cy="100" r="5" />
      </g>

      <g className="ex-machine">
        {/* tracks */}
        <rect x="30" y="166" width="160" height="30" rx="15" fill="#1d2127" />
        <rect x="36" y="171" width="148" height="20" rx="10" fill="url(#ex-steel)" />
        <path
          d="M44 166v4M56 166v4M68 166v4M80 166v4M92 166v4M104 166v4M116 166v4M128 166v4M140 166v4M152 166v4M164 166v4M176 166v4"
          stroke="#4b525c"
          strokeWidth="2"
        />
        {rollers.map((x) => (
          <g key={x}>
            <circle cx={x} cy="181" r="7" fill="#5b626d" />
            <circle cx={x} cy="181" r="2.6" fill="#1d2127" />
          </g>
        ))}

        {/* swing base */}
        <rect x="78" y="156" width="72" height="12" rx="3" fill="#2b3038" />

        {/* house */}
        <path d="M32 156V128q0-10 10-10h110l10 12v26z" fill="url(#ex-body)" />
        <rect x="26" y="128" width="20" height="28" rx="7" fill="#d4870a" />
        <rect x="32" y="149" width="130" height="7" fill="#b9760a" opacity="0.55" />
        <path d="M52 126v16M58 126v16M64 126v16M70 126v16M76 126v16" stroke="#b9760a" strokeWidth="1.6" />
        <rect x="64" y="104" width="5" height="16" rx="1.5" fill="#262a31" />
        <path d="M36 120h112" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" />

        {/* cab */}
        <path d="M108 120V76q0-7 7-7h26q6 0 8 6l10 45z" fill="url(#ex-body)" />
        <path d="M114 114V81q0-5 5-5h20q3 0 4 3l9 35z" fill="url(#ex-glass)" />
        <g clipPath="url(#ex-window)">
          <path className="ex-glint" d="M120 70h7l-12 50h-7z" fill="#fff" opacity="0.35" />
        </g>
        <path d="M131 76v38" stroke="#e8940c" strokeWidth="2" />

        {/* arm: boom > stick > bucket */}
        <g className="ex-boom">
          <path d="M138 146L176 92" stroke="#3a3f47" strokeWidth="7" strokeLinecap="round" />
          <path d="M160 116L186 80" stroke="url(#ex-chrome)" strokeWidth="3.4" strokeLinecap="round" />

          <path d="M148 134l12-12 40-76q5-8 13-3l31 23-8 12-26-18-42 76z" fill="url(#ex-boom)" />
          <path d="M160 122l40-76q5-8 13-3" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.4" fill="none" />

          <path d="M196 56L232 50" stroke="#3a3f47" strokeWidth="6" strokeLinecap="round" />
          <path d="M210 54L232 50" stroke="url(#ex-chrome)" strokeWidth="3" strokeLinecap="round" />

          <g className="ex-stick">
            <path d="M228 50l13-3 17 102-11 5z" fill="url(#ex-boom)" />
            <path d="M241 47l17 102" stroke="#b9760a" strokeWidth="1.4" />

            <g className="ex-bucket">
              <path d="M242 144l26-3q9 25-7 46l-30-2q8-17 11-41z" fill="url(#ex-steel)" />
              <path d="M246 150l16-2q5 18-5 32l-18-1q6-12 7-29z" fill="#16191e" opacity="0.6" />
              {bucketTeeth.map((x) => (
                <path key={x} d={`M${x} 185l3 7 3-7z`} fill="#2b3038" />
              ))}
              <g className="ex-load" fill="url(#ex-dirt)">
                <ellipse cx="249" cy="176" rx="12" ry="7" />
                <circle cx="242" cy="172" r="4" />
                <circle cx="254" cy="170" r="3.5" />
              </g>
            </g>

            <g fill="#b99a6b">
              <circle className="ex-fall" cx="236" cy="180" r="2.6" />
              <circle className="ex-fall" cx="243" cy="184" r="2" />
              <circle className="ex-fall" cx="249" cy="181" r="2.8" />
              <circle className="ex-fall" cx="239" cy="187" r="1.8" />
            </g>

            <Pin x={252} y={150} />
          </g>

          <Pin x={240} y={70} />
          <Pin x={232} y={50} />
        </g>

        <Pin x={156} y={128} />
      </g>

      {/* dirt mound the bucket digs into — drawn last so teeth sink behind it */}
      <ellipse className="ex-dust" cx="252" cy="190" rx="22" ry="7" fill="#e7d6b8" filter="url(#ex-soft)" />
      <path d="M216 200q14-16 32-15t44 15z" fill="url(#ex-dirt)" />
      <path d="M228 194q10-6 20-6" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" fill="none" />
      <circle cx="226" cy="198" r="2" fill="#a8875a" />
      <circle cx="284" cy="197" r="1.6" fill="#a8875a" />
    </svg>
  );
}

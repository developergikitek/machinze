import type { ReactNode } from "react";

// Category illustrations (parent size deta hai) — ek hi palette (amber + steel) taaki grid ek set lage
const Y = "#f5b014";
const YD = "#d98e0b";
const DK = "#2b2f36";
const GR = "#5b626d";
const LT = "#c9ced6";

function Art({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      {children}
    </svg>
  );
}

export const CATEGORY_ART: Record<string, ReactNode> = {
  excavators: (
    <Art>
      <rect x="4" y="36" width="26" height="7" rx="3.5" fill={DK} />
      <circle cx="9" cy="39.5" r="1.6" fill={GR} />
      <circle cx="17" cy="39.5" r="1.6" fill={GR} />
      <circle cx="25" cy="39.5" r="1.6" fill={GR} />
      <path d="M5 35V28q0-2 2-2h18l3 3v6z" fill={Y} />
      <path d="M17 26V17q0-2 2-2h5l3 11z" fill={Y} />
      <path d="M19 25v-8h4l2 8z" fill="#2f4466" />
      <path d="M26 29l9-17 4 1 6 9-2 2-5-6-9 13z" fill={YD} />
      <path d="M41 23l4 2 1 9-6 2-3-3 3-1z" fill={DK} />
    </Art>
  ),
  trucks: (
    <Art>
      <path d="M3 18h25l4 5v13H3z" fill={Y} />
      <path d="M3 18h25l4 5H3z" fill={YD} />
      <path d="M32 24h7l5 6v6H32z" fill={Y} />
      <path d="M34 25.5h4.5l3.5 4.5h-8z" fill="#2f4466" />
      <rect x="3" y="34" width="42" height="3" fill={DK} />
      {[10, 20, 38].map((x) => (
        <g key={x}>
          <circle cx={x} cy="38" r="4.2" fill={DK} />
          <circle cx={x} cy="38" r="1.7" fill={LT} />
        </g>
      ))}
    </Art>
  ),
  generators: (
    <Art>
      <rect x="4" y="13" width="40" height="24" rx="3" fill={Y} />
      <rect x="4" y="13" width="40" height="5" rx="2" fill={YD} />
      <path d="M9 22h14M9 26h14M9 30h14" stroke={YD} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="28" y="21" width="11" height="11" rx="1.5" fill={DK} />
      <circle cx="31.5" cy="25" r="1.4" fill="#5ee08a" />
      <rect x="34" y="24" width="3.5" height="2" rx="0.6" fill={LT} />
      <rect x="8" y="37" width="5" height="4" rx="1" fill={DK} />
      <rect x="35" y="37" width="5" height="4" rx="1" fill={DK} />
    </Art>
  ),
  survey: (
    <Art>
      <rect x="18" y="5" width="12" height="11" rx="2" fill={Y} />
      <rect x="20" y="8" width="8" height="5" rx="1" fill="#2f4466" />
      <rect x="21" y="16" width="6" height="3" fill={DK} />
      <path d="M24 19L12 44M24 19v25M24 19l12 25" stroke={YD} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M15 37h18" stroke={DK} strokeWidth="1.6" />
    </Art>
  ),
  "power-tools": (
    <Art>
      <path d="M8 12h22q4 0 4 4v4q0 4-4 4H8z" fill={Y} />
      <rect x="34" y="15" width="6" height="6" rx="1" fill={DK} />
      <path d="M40 18h6" stroke={GR} strokeWidth="2" strokeLinecap="round" />
      <path d="M14 24h10l-2 14h-8z" fill={DK} />
      <rect x="11" y="37" width="16" height="7" rx="2" fill={Y} />
      <rect x="11" y="37" width="16" height="2.5" fill={YD} />
      <path d="M12 16h14" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
    </Art>
  ),
  more: (
    <Art>
      {[
        [10, 10],
        [26, 10],
        [10, 26],
        [26, 26],
      ].map(([x, y]) => (
        <rect key={`${x}${y}`} x={x} y={y} width="12" height="12" rx="3" fill="none" stroke="#111c4e" strokeWidth="2.6" />
      ))}
    </Art>
  ),
  cranes: (
    <Art>
      <path d="M14 27L40 6l2 2.5-25 21z" fill={YD} />
      <path d="M41 8v13" stroke={DK} strokeWidth="1.2" />
      <path d="M39.5 21h3l-1.5 3z" fill={DK} />
      <path d="M4 28h28l3 4v5H4z" fill={Y} />
      <path d="M8 22h8v6H8z" fill={Y} />
      <path d="M9.5 23.5h5v4h-5z" fill="#2f4466" />
      <rect x="4" y="35" width="40" height="3" fill={DK} />
      {[9, 18, 36].map((x) => (
        <g key={x}>
          <circle cx={x} cy="39" r="3.8" fill={DK} />
          <circle cx={x} cy="39" r="1.5" fill={LT} />
        </g>
      ))}
    </Art>
  ),
  loaders: (
    <Art>
      <path d="M14 30V16q0-2 2-2h9l3 9v7z" fill={Y} />
      <path d="M17 22v-6h7l2 6z" fill="#2f4466" />
      <path d="M6 30h28v6H6z" fill={Y} />
      <path d="M33 24l7 4" stroke={YD} strokeWidth="3" strokeLinecap="round" />
      <path d="M38 24h8l-2 12h-8z" fill={DK} />
      <circle cx="13" cy="37" r="6" fill={DK} />
      <circle cx="13" cy="37" r="2.4" fill={LT} />
      <circle cx="31" cy="38" r="5" fill={DK} />
      <circle cx="31" cy="38" r="2" fill={LT} />
    </Art>
  ),
  compactors: (
    <Art>
      <rect x="2" y="27" width="16" height="15" rx="7.5" fill={DK} />
      <rect x="4" y="29" width="12" height="11" rx="5.5" fill={GR} />
      <path d="M14 30h22v8H14z" fill={Y} />
      <path d="M20 30V18q0-2 2-2h9l3 14z" fill={Y} />
      <path d="M22 28V18h8l2 10z" fill="#2f4466" />
      <path d="M18 16h17" stroke={DK} strokeWidth="2" strokeLinecap="round" />
      <circle cx="39" cy="38" r="6" fill={DK} />
      <circle cx="39" cy="38" r="2.4" fill={LT} />
    </Art>
  ),
  concrete: (
    <Art>
      <path d="M4 15l22-4 4 4v14L6 31q-3-8-2-16z" fill={Y} />
      <path d="M10 13l3 17M17 12l2 18M24 11l1 19" stroke={YD} strokeWidth="2" />
      <path d="M30 22h7l6 6v8H30z" fill={Y} />
      <path d="M32 23.5h4.5l4.5 4.5h-9z" fill="#2f4466" />
      <rect x="3" y="33" width="41" height="3" fill={DK} />
      {[10, 19, 38].map((x) => (
        <g key={x}>
          <circle cx={x} cy="38" r="4" fill={DK} />
          <circle cx={x} cy="38" r="1.6" fill={LT} />
        </g>
      ))}
    </Art>
  ),
  lifts: (
    <Art>
      <rect x="7" y="6" width="34" height="3" fill={DK} />
      <path d="M8 9v6M18 9v6M30 9v6M40 9v6" stroke={DK} strokeWidth="2" />
      <rect x="6" y="14" width="36" height="4" rx="1" fill={Y} />
      <path d="M10 18l28 8M38 18l-28 8M10 26l28 8M38 26l-28 8" stroke={YD} strokeWidth="2.4" strokeLinecap="round" />
      <rect x="6" y="34" width="36" height="5" rx="1.5" fill={Y} />
      <circle cx="11" cy="41.5" r="2.8" fill={DK} />
      <circle cx="37" cy="41.5" r="2.8" fill={DK} />
    </Art>
  ),
  attachments: (
    <Art>
      <path d="M8 12q14-6 32 2l-2 16q-14 6-28 0z" fill={Y} />
      <path d="M8 12q14-6 32 2l-1 4q-15-6-30-1z" fill={YD} />
      <path d="M10 30l-2 7h6l-1-7M17 31l-1 7h6l-1-7M24 31l-1 7h6l-1-7M31 30l-1 7h6l-1-7" fill={DK} />
      <rect x="18" y="5" width="12" height="6" rx="2" fill={DK} />
      <circle cx="21" cy="8" r="1.3" fill={LT} />
      <circle cx="27" cy="8" r="1.3" fill={LT} />
    </Art>
  ),
};

import ExcavatorScene from "@/components/auth/ExcavatorScene";
import type { EquipmentArt as ArtKind } from "@/lib/equipment";

const Y = "#f5b014";
const YD = "#d98e0b";
const DK = "#23272e";
const GR = "#4b525c";
const GLASS = "#2f4466";

function Skyline() {
  return (
    <g fill="#64748b" opacity="0.12">
      <rect x="6" y="70" width="18" height="70" />
      <rect x="28" y="52" width="14" height="88" />
      <rect x="46" y="80" width="20" height="60" />
      <rect x="140" y="60" width="16" height="80" />
      <rect x="160" y="78" width="22" height="62" />
      <rect x="186" y="66" width="14" height="74" />
    </g>
  );
}

function Shadow() {
  return <ellipse cx="100" cy="146" rx="80" ry="5" fill="#0f172a" opacity="0.18" />;
}

function Wheel({ x, y, r = 11 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={DK} />
      <circle cx={x} cy={y} r={r * 0.45} fill="#9aa3ae" />
      <circle cx={x} cy={y} r={r * 0.15} fill={DK} />
    </g>
  );
}

function CraneTruck() {
  return (
    <svg viewBox="0 0 200 170" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-[14%] h-[86%] w-full">
      <Skyline />
      <Shadow />
      {/* boom + hook */}
      <path d="M58 98L150 22l6 7-88 76z" fill={YD} />
      <path d="M62 98L150 25" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5" />
      <rect x="132" y="38" width="5" height="22" rx="1" fill={Y} transform="rotate(-40 134 49)" />
      <path d="M154 27v44" stroke={DK} strokeWidth="1.4" />
      <path d="M150 71h8l-4 7z" fill={DK} />
      <path d="M154 78q-4 5 0 8" stroke={DK} strokeWidth="1.8" fill="none" />
      {/* body */}
      <rect x="20" y="104" width="150" height="16" rx="2" fill={Y} />
      <rect x="20" y="114" width="150" height="6" fill={YD} />
      <path d="M44 88h40v16H44z" fill={Y} />
      <rect x="52" y="92" width="18" height="10" fill={GLASS} />
      <path d="M150 82h18q6 0 8 6l4 16h-30z" fill={Y} />
      <path d="M154 86h12q3 0 4 3l3 11h-19z" fill={GLASS} />
      <rect x="14" y="120" width="172" height="6" fill={DK} />
      {/* outriggers */}
      <path d="M30 126v12h-6M140 126v12h6" stroke={GR} strokeWidth="3" />
      {[42, 66, 90, 140, 166].map((x) => (
        <Wheel key={x} x={x} y={132} r={10} />
      ))}
    </svg>
  );
}

function Generator() {
  return (
    <svg viewBox="0 0 200 170" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-[14%] h-[86%] w-full">
      <Skyline />
      <Shadow />
      <rect x="22" y="60" width="156" height="72" rx="5" fill={Y} />
      <rect x="22" y="60" width="156" height="10" rx="4" fill={YD} />
      <rect x="22" y="124" width="156" height="8" fill={YD} />
      {/* louvres */}
      {[78, 86, 94, 102, 110].map((y) => (
        <rect key={y} x="34" y={y} width="62" height="4" rx="2" fill={DK} opacity="0.75" />
      ))}
      {/* doors + panel */}
      <path d="M104 74v48M140 74v48" stroke={YD} strokeWidth="1.6" />
      <rect x="146" y="80" width="24" height="26" rx="2" fill={DK} />
      <circle cx="152" cy="87" r="2" fill="#5ee08a" />
      <rect x="157" y="85" width="9" height="4" rx="1" fill="#9aa3ae" />
      <rect x="150" y="94" width="16" height="2" fill="#9aa3ae" />
      <rect x="150" y="99" width="10" height="2" fill="#9aa3ae" />
      <rect x="112" y="92" width="3" height="10" rx="1" fill={DK} />
      <rect x="128" y="92" width="3" height="10" rx="1" fill={DK} />
      {/* exhaust */}
      <rect x="60" y="48" width="8" height="12" rx="1.5" fill={GR} />
      {/* skid */}
      <rect x="16" y="132" width="168" height="6" rx="2" fill={DK} />
      <path d="M22 60h156" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.4" />
    </svg>
  );
}

// Photo ki jagah — kisi bhi aspect ratio me poori machine dikhti hai. Asli photo ho to <img> (EquipmentTile)
export default function EquipmentArt({ kind }: { kind: ArtKind }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#e6eef9] via-[#eef2f7] to-[#f4efe6]">
      <div className="absolute inset-x-0 bottom-0 h-[20%] border-t-[3px] border-[#c4ae88] bg-[#d7c5a6]" />
      {kind === "excavator" && (
        <ExcavatorScene className="absolute inset-x-0 bottom-[11%] h-[89%] w-full" />
      )}
      {kind === "crane" && <CraneTruck />}
      {kind === "generator" && <Generator />}
    </div>
  );
}

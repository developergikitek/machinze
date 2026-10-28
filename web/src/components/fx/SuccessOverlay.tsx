"use client";

import type { CSSProperties } from "react";
import { createPortal } from "react-dom";

const BURST_COLORS = ["#f5a91b", "#111c4e", "#ffcb45", "#1a2766"];

type Props = {
  title: string;
  subtitle?: string;
};

// Form submit ke baad: ring + checkmark draw + chhota sa burst (styles: app/fx.css).
// Portal se body me — animated (transformed) parent ke andar `fixed` poori screen cover nahi karta.
export default function SuccessOverlay({ title, subtitle }: Props) {
  return createPortal(
    <div
      role="status"
      className="fx-success fixed inset-0 z-50 flex items-center justify-center bg-white/80 px-6 backdrop-blur-sm"
    >
      <div className="fx-success-card flex flex-col items-center text-center">
        <div className="relative h-24 w-24">
          <div className="fx-success-burst absolute inset-0" aria-hidden>
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                style={{ "--a": `${i * 36}deg`, background: BURST_COLORS[i % 4] } as CSSProperties}
              />
            ))}
          </div>
          <svg viewBox="0 0 64 64" className="relative h-24 w-24" aria-hidden>
            <circle cx="32" cy="32" r="30" fill="#fff7e6" />
            <circle
              className="fx-success-ring"
              cx="32"
              cy="32"
              r="30"
              fill="none"
              stroke="#f5a91b"
              strokeWidth="3"
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
            />
            <path
              className="fx-success-check"
              d="M20 33l8 8 16-17"
              fill="none"
              stroke="#111c4e"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="mt-5 text-[22px] font-extrabold tracking-tight text-navy-950">{title}</p>
        {subtitle && <p className="mt-1 text-[14px] text-slate-500">{subtitle}</p>}
      </div>
    </div>,
    document.body,
  );
}

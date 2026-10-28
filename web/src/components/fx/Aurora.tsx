import type { CSSProperties } from "react";

// [left %, delay s, duration s, sway px]
const SPARKS: [number, number, number, number][] = [
  [8, 0, 6.5, 14],
  [22, 2.2, 7, -10],
  [37, 4.1, 6, 18],
  [55, 1.1, 7.5, -16],
  [68, 3.3, 6.2, 10],
  [82, 0.6, 7.2, -12],
  [93, 2.8, 6.8, 8],
];

// Hero ke peeche dheere tairte soft color blobs + upar uthte chamakte kan (styles: app/fx.css)
export default function Aurora({ sparkles = true }: { sparkles?: boolean }) {
  return (
    <>
      <div className="fx-aurora" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      {sparkles && (
        <div className="fx-sparkles" aria-hidden>
          {SPARKS.map(([left, delay, dur, sway]) => (
            <span
              key={left}
              style={
                {
                  left: `${left}%`,
                  "--delay": `${delay}s`,
                  "--dur": `${dur}s`,
                  "--sway": `${sway}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
    </>
  );
}

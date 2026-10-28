"use client";

import { useState } from "react";

import { dayOffset } from "@/lib/dates";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MAX_MONTHS_AHEAD = 3;

type Props = {
  today: Date;
  start: number | null;
  end: number | null;
  isBooked: (offset: number) => boolean;
  onPick: (offset: number) => void;
};

// Month grid (Mon se shuru). start/end = aaj se din ka offset; end null = sirf ek din
export default function RangeCalendar({ today, start, end, isBooked, onPick }: Props) {
  const [monthShift, setMonthShift] = useState(0);
  const month = new Date(today.getFullYear(), today.getMonth() + monthShift, 1);
  const lead = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  // Jo hafte poore beet chuke, wo mat dikhao — calendar chhota, kaam ke din upar
  const weeks = Array.from({ length: Math.ceil(cells.length / 7) }, (_, w) => cells.slice(w * 7, w * 7 + 7)).filter((week) =>
    week.some((d) => d && dayOffset(today, d) >= 0),
  );
  const last = end ?? start;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-navy-950">
          {month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-1">
          {[
            ["Previous month", -1, "m15 6-6 6 6 6"],
            ["Next month", 1, "m9 6 6 6-6 6"],
          ].map(([label, step, d]) => (
            <button
              key={label as string}
              type="button"
              aria-label={label as string}
              disabled={step === -1 ? monthShift === 0 : monthShift === MAX_MONTHS_AHEAD}
              onClick={() => setMonthShift((m) => m + (step as number))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-navy-950 transition hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={d as string} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-slate-400">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="pb-2">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {weeks.flat().map((d, i) => {
          if (!d) return <span key={`x${i}`} />;
          const col = i % 7;
          const off = dayOffset(today, d);
          const past = off < 0;
          const booked = !past && isBooked(off);
          const disabled = past || booked;
          const isStart = off === start;
          const isEnd = off === last;
          const inRange = start !== null && last !== null && off > start && off < last;
          const edge = isStart || isEnd;
          const hasRange = start !== null && last !== null && last > start;

          return (
            <div key={off} className="relative flex h-11 items-center justify-center">
              {/* range ki patti — start se end tak jodne wali */}
              {(inRange || (edge && hasRange)) && (
                <span
                  className={`absolute inset-y-1 bg-slate-100 ${
                    isStart ? "left-1/2 right-0" : isEnd ? "left-0 right-1/2" : "inset-x-0"
                  } ${col === 0 && !isStart ? "rounded-l-full" : ""} ${col === 6 && !isEnd ? "rounded-r-full" : ""}`}
                />
              )}
              <button
                type="button"
                disabled={disabled}
                aria-pressed={edge || inRange}
                aria-label={`${d.toDateString()}${booked ? ", booked" : ""}`}
                onClick={() => onPick(off)}
                className={`relative flex h-9 w-9 flex-col items-center justify-center rounded-full text-[14px] transition ${
                  edge
                    ? "bg-navy-950 font-semibold text-white"
                    : disabled
                      ? `text-slate-300 ${booked ? "line-through" : ""}`
                      : "font-medium text-navy-950 hover:bg-slate-100"
                }`}
              >
                {d.getDate()}
                {off === 0 && !edge && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-amber-brand" />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-brand" /> Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-300 line-through">12</span> Booked
        </span>
        <span className="ml-auto text-slate-400">Up to 3 months ahead</span>
      </div>
    </div>
  );
}

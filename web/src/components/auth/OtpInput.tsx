"use client";

import { ClipboardEvent, KeyboardEvent, useEffect, useRef } from "react";

type Props = {
  length?: number;
  value: string;
  error?: boolean;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
};

// 6 alag boxes — type karte hi agla box, backspace pe pichla, paste / SMS autofill pe saare bhar jaate hain
export default function OtpInput({ length = 6, value, error, onChange, onComplete }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigits = (digits: string, from: number) => {
    const chars = value.padEnd(length, " ").split("");
    digits
      .slice(0, length - from)
      .split("")
      .forEach((d, i) => (chars[from + i] = d));
    const next = chars.join("").replace(/\s+$/, "");
    onChange(next);
    const focusAt = Math.min(from + digits.length, length - 1);
    refs.current[focusAt]?.focus();
    if (next.replace(/\s/g, "").length === length) onComplete?.(next);
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i]?.trim() && i > 0) {
      e.preventDefault();
      onChange(value.slice(0, i - 1));
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    e.preventDefault();
    setDigits(digits, i);
  };

  return (
    <div className="flex justify-between gap-2" data-field="otp">
      {Array.from({ length }, (_, i) => {
        const digit = value[i]?.trim() ?? "";
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            aria-label={`Digit ${i + 1}`}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={i === 0 ? length : 1}
            value={digit}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              if (digits) setDigits(digits, i);
              else {
                const padded = value.padEnd(length, " ");
                onChange((padded.slice(0, i) + " " + padded.slice(i + 1)).replace(/\s+$/, ""));
              }
            }}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={(e) => onPaste(i, e)}
            onFocus={(e) => e.target.select()}
            className={`autofill-reset h-[56px] w-full min-w-0 rounded-2xl border bg-white text-center text-[22px] font-bold text-navy-950 caret-navy-800 outline-none transition focus:border-navy-800 focus:ring-4 focus:ring-navy-800/10 ${
              error ? "border-red-400" : digit ? "border-navy-800/40" : "border-slate-200"
            }`}
          />
        );
      })}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { ROUTES } from "@/lib/routes";

// Simple page header (back + title) — un pages ke liye jahan native header hidden hai
type Props = {
  title: string;
  // e.g. "Step 1 of 2"
  step?: string;
  fallback?: string;
  // daayein taraf (e.g. help button)
  action?: ReactNode;
};

export default function PageHeader({ title, step, fallback = ROUTES.home, action }: Props) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 grid h-14 grid-cols-[48px_1fr_48px] items-center bg-white px-2">
      <button
        type="button"
        aria-label="Back"
        onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
        className="flex h-10 w-10 items-center justify-center rounded-full text-navy-950 transition hover:bg-slate-100 active:scale-90"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </button>
      <div className="text-center">
        <h1 className="text-[16px] font-semibold leading-tight text-navy-950">{title}</h1>
        {step && <p className="text-[11px] font-medium text-slate-500">{step}</p>}
      </div>
      <div className="flex justify-end">{action}</div>
    </header>
  );
}

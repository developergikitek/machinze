"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { ROUTES } from "@/lib/routes";

type Props = {
  initialQuery?: string;
  autoFocus?: boolean;
};

// Uber ke "Where to?" jaisa — bada grey pill + "kab chahiye" chip. TODO: date picker
export default function SearchPill({ initialQuery = "", autoFocus }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    (document.activeElement as HTMLElement | null)?.blur();
    router.push(ROUTES.search({ q: query.trim() }));
  };

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="flex h-[58px] items-center gap-3 rounded-full bg-[#f2f3f5] pl-5 pr-2 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-navy-950"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0b1437" strokeWidth="2.4" strokeLinecap="round" className="shrink-0" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        enterKeyHint="search"
        placeholder="Search equipment"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="autofill-reset h-full min-w-0 flex-1 bg-transparent text-[17px] font-semibold text-navy-950 outline-none placeholder:text-navy-950/85 [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="button"
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] font-semibold text-navy-950 shadow-[0_1px_3px_rgba(11,20,55,0.12)] transition active:scale-95"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        Today
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </form>
  );
}

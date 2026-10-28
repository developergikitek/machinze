"use client";

import { ReactNode, useRef, useState } from "react";

type Tab = { key: string; label: string; content: ReactNode };

// Header ke neeche chipke tabs — ek waqt pe ek panel, isliye screen nahi bharti
export default function DetailTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0].key);
  const bar = useRef<HTMLDivElement>(null);

  const select = (key: string) => {
    setActive(key);
    // neeche scroll kiya ho to naya tab upar se dikhe
    const top = (bar.current?.offsetTop ?? 0) - 56;
    if (window.scrollY > top) window.scrollTo({ top });
  };

  return (
    <>
      <div ref={bar} role="tablist" className="sticky top-14 z-20 flex border-b border-slate-200 bg-white px-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === active}
            onClick={() => select(t.key)}
            className={`relative h-11 flex-1 text-[14px] font-medium transition ${t.key === active ? "text-navy-950" : "text-slate-400"}`}
          >
            {t.label}
            {t.key === active && <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-navy-950" />}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} role="tabpanel" hidden={t.key !== active} className="px-4 py-5">
          {t.content}
        </div>
      ))}
    </>
  );
}

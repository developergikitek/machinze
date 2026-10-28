"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { CATEGORY_ART } from "@/components/home/CategoryIcons";
import EquipmentTile from "@/components/home/EquipmentTile";
import SearchPill from "@/components/home/SearchPill";
import { searchEquipment } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";

const CATEGORIES = [
  { key: "excavators", label: "Excavators" },
  { key: "cranes", label: "Cranes" },
  { key: "trucks", label: "Trucks" },
  { key: "generators", label: "Generators" },
  { key: "loaders", label: "Loaders" },
  { key: "compactors", label: "Compactors" },
  { key: "lifts", label: "Lifts" },
];

export default function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const results = searchEquipment({ q, category });
  const chips = useRef<HTMLDivElement>(null);

  // chuni hui category chip nazar me rahe
  useEffect(() => {
    chips.current?.querySelector("[aria-current]")?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [category]);

  return (
    <>
      {/* key: URL badle to input bhi naye query se reset ho */}
      <SearchPill key={q} initialQuery={q} />

      <div ref={chips} className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
        <Link
          href={ROUTES.search({ q })}
          aria-current={!category || undefined}
          className={`flex h-9 shrink-0 items-center rounded-full px-4 text-[13px] font-semibold transition ${
            !category ? "bg-navy-950 text-white" : "bg-[#f2f3f5] text-navy-950"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={ROUTES.search({ q, category: c.key })}
            aria-current={category === c.key || undefined}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full pl-2.5 pr-4 text-[13px] font-semibold transition ${
              category === c.key ? "bg-navy-950 text-white" : "bg-[#f2f3f5] text-navy-950"
            }`}
          >
            <span className="h-5 w-5">{CATEGORY_ART[c.key]}</span>
            {c.label}
          </Link>
        ))}
      </div>

      <p className="mt-5 text-[13px] font-semibold text-slate-500">
        {results.length} {results.length === 1 ? "result" : "results"} near you
      </p>

      {results.length ? (
        <div className="fx-stagger mt-3 grid gap-6">
          {results.map((item) => (
            <EquipmentTile key={item.id} item={item} unit="day" fullWidth />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center text-center">
          <span className="h-16 w-16 opacity-60">{CATEGORY_ART[category || "excavators"]}</span>
          <p className="mt-3 text-[16px] font-bold text-navy-950">Nothing nearby yet</p>
          <p className="mt-1 max-w-[260px] text-[13px] text-slate-500">Try another category or search term — new machines are added every day.</p>
          <Link href={ROUTES.search()} className="mt-4 rounded-full bg-navy-950 px-5 py-2.5 text-[13px] font-semibold text-white">
            Show all equipment
          </Link>
        </div>
      )}
    </>
  );
}

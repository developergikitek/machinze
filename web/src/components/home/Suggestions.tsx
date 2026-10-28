import Link from "next/link";

import { ROUTES } from "@/lib/routes";

import { CATEGORY_ART } from "./CategoryIcons";

// Uber "Suggestions" jaisa — kam, bade tiles. Baaki categories "See all" me
const SUGGESTIONS = [
  { key: "excavators", label: "Excavator", tag: "Popular" },
  { key: "cranes", label: "Crane" },
  { key: "trucks", label: "Truck" },
  { key: "generators", label: "Generator" },
];

export default function Suggestions() {
  return (
    <ul className="grid grid-cols-4 gap-3">
      {SUGGESTIONS.map(({ key, label, tag }) => (
        <li key={key}>
          <Link
            href={ROUTES.search({ category: key })}
            className="group flex w-full flex-col items-center gap-2 transition active:scale-95"
          >
            <span className="relative flex aspect-square w-full items-center justify-center rounded-2xl bg-[#f2f3f5] transition group-hover:bg-[#eceef1]">
              {tag && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-brand px-2 py-px text-[10px] font-bold text-navy-950">
                  {tag}
                </span>
              )}
              <span className="h-[58%] w-[58%]">{CATEGORY_ART[key]}</span>
            </span>
            <span className="text-[13px] font-semibold text-navy-950">{label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

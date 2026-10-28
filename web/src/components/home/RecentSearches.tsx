import Link from "next/link";

import { RECENT_SEARCHES } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";

export default function RecentSearches() {
  return (
    <ul className="divide-y divide-slate-100">
      {RECENT_SEARCHES.map(({ query, place, equipmentId }) => (
        <li key={query}>
          <Link
            href={ROUTES.equipment(equipmentId)}
            className="flex w-full items-center gap-4 py-3 text-left transition active:opacity-60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f3f5]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b1437" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 2" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold text-navy-950">{query}</span>
              <span className="block truncate text-[13px] text-slate-500">{place}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

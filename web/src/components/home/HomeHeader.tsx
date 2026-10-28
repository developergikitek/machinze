"use client";

import Link from "next/link";

import { AppLocation, useAppLocation } from "@/lib/appLocation";
import { UNREAD_NOTIFICATIONS } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";

// "Sector 18, Noida" — area pehle
function label(location: AppLocation | null) {
  if (!location) return null;
  const city = location.city.split(",")[0]?.trim();
  return { area: location.area, city };
}

// Swiggy jaisa — page ke saath scroll hoke upar chala jaata hai (fixed nahi). Tap → /location picker.
export default function HomeHeader() {
  const location = useAppLocation();
  const place = label(location);

  return (
    <header className="flex items-center justify-between gap-3 pt-3">
      <Link href={ROUTES.location()} className="flex min-w-0 items-start gap-1.5 text-left">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f5a91b" className="mt-0.5 shrink-0" aria-hidden>
          <path d="M12 22s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12Zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        </svg>
        <span className="min-w-0">
          <span className="flex items-center gap-1 text-[16px] font-bold text-navy-950">
            <span className="truncate">{place?.area ?? "Set location"}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="shrink-0" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
          <span className="block truncate text-[12px] text-slate-500">{place?.city || "Tap to search or use current location"}</span>
        </span>
      </Link>

      <Link href={ROUTES.notifications} aria-label={`Inbox, ${UNREAD_NOTIFICATIONS} unread`} className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f3f5] text-navy-950">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 13.5 6.4 6.2A2 2 0 0 1 8.3 4.8h7.4a2 2 0 0 1 1.9 1.4L20 13.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4.5Z" />
          <path d="M4 13.5h4.5l1.2 2.5h4.6l1.2-2.5H20" />
        </svg>
        {UNREAD_NOTIFICATIONS > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-amber-brand px-1 text-[10px] font-bold text-white">
            {UNREAD_NOTIFICATIONS > 9 ? "9+" : UNREAD_NOTIFICATIONS}
          </span>
        )}
      </Link>
    </header>
  );
}

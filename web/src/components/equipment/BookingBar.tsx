import Link from "next/link";

import { Equipment, formatINR } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";

// Neeche chipki patti — Book Now se dates wala page (/client/book/[id])
export default function BookingBar({ item }: { item: Equipment }) {
  return (
    <>
      <div aria-hidden className="h-[84px]" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-extrabold tracking-tight text-navy-950">
              {formatINR(item.pricePerDay)}
              <span className="text-[13px] font-medium text-slate-500"> / day</span>
            </p>
            <p className="truncate text-[12px] text-slate-500">
              {item.available ? `or ${formatINR(item.pricePerHour)} / hour` : "Currently not available"}
            </p>
          </div>
          {item.available ? (
            <Link
              href={ROUTES.book(item.id)}
              className="flex h-[50px] items-center rounded-2xl bg-navy-950 px-7 text-[16px] font-bold text-white transition active:scale-[0.97]"
            >
              Book Now
            </Link>
          ) : (
            <span className="flex h-[50px] items-center rounded-2xl bg-navy-950/40 px-7 text-[16px] font-bold text-white">Unavailable</span>
          )}
        </div>
      </div>
    </>
  );
}

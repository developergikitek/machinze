import type { ReactNode } from "react";

import { Equipment } from "@/lib/equipment";

// Booking steps ke upar — kya book ho raha hai (+ optional neeche ki line, e.g. dates)
export default function EquipmentSummary({ item, children }: { item: Equipment; children?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <div className="flex items-center gap-3">
        <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f2f3f5]">
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element -- backend URLs, sizes unknown
            <img src={item.image} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-navy-950">{item.name}</p>
          <p className="truncate text-[12px] text-slate-500">
            {item.vendor.name} · {item.area.split(",")[0]}
          </p>
        </div>
      </div>
      {children && <div className="mt-3 border-t border-slate-100 pt-3">{children}</div>}
    </div>
  );
}

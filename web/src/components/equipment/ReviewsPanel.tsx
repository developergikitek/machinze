import { Equipment } from "@/lib/equipment";

import { Group } from "./Group";
import Stars from "./Stars";

export default function ReviewsPanel({ item }: { item: Equipment }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl bg-white px-4 py-4">
        <p className="text-[36px] font-semibold leading-none tracking-tight text-navy-950">{item.rating}</p>
        <div>
          <Stars value={item.rating} size={14} />
          <p className="mt-1 text-[13px] text-slate-500">Based on {item.reviews} rentals</p>
        </div>
      </div>

      <Group label="Recent">
        {item.reviewsList.map((r) => (
          <figure key={r.name} className="border-b border-slate-100 px-4 py-3.5 last:border-b-0">
            <div className="flex items-center justify-between">
              <figcaption className="text-[14px] font-semibold text-navy-950">{r.name}</figcaption>
              <span className="text-[12px] text-slate-400">{r.date}</span>
            </div>
            <Stars value={r.rating} />
            <blockquote className="mt-1.5 text-[14px] leading-relaxed text-slate-600">{r.text}</blockquote>
          </figure>
        ))}
      </Group>
      {/* TODO: saare reviews (paginated) */}
      <button type="button" className="h-11 w-full rounded-2xl bg-white text-[14px] font-semibold text-navy-950 transition active:scale-[0.98]">
        Show all {item.reviews} reviews
      </button>
    </div>
  );
}

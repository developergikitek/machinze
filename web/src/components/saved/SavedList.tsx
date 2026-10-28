"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import EquipmentArt from "@/components/home/EquipmentArt";
import { addDays, formatDay } from "@/lib/dates";
import { Equipment, formatINR, getEquipment } from "@/lib/equipment";
import { haptic } from "@/lib/native";
import { ROUTES } from "@/lib/routes";
import { restoreItem, SavedItem, unsaveItem, useSaved } from "@/lib/saved";
import { useNowMinute } from "@/lib/useNow";

const UNDO_MS = 4000;

// "excavators" → "Excavators"
const categoryLabel = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

// item.availability = aaj se agle 7 din (true = free)
function availabilityText(item: Equipment, today: Date) {
  if (!item.available) return { text: "Currently unavailable", free: false };
  if (item.availability[0] !== false) return { text: "Available today", free: true };
  const next = item.availability.indexOf(true);
  return next > 0
    ? { text: `Free from ${formatDay(addDays(today, next))}`, free: false }
    : { text: "Booked this week", free: false };
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" aria-hidden>
      <path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7 3.9 4 7.1 4c2 0 3.4 1.1 4.9 2.8C13.5 5.1 14.9 4 16.9 4c3.2 0 5.5 3 4.3 6.6C19.5 15.4 12 20 12 20Z" />
    </svg>
  );
}

function SavedCard({ item, saved, today, onRemove }: { item: Equipment; saved: SavedItem; today: Date; onRemove: () => void }) {
  const drop = saved.pricePerDay - item.pricePerDay;
  const status = availabilityText(item, today);

  return (
    <article className="relative rounded-2xl bg-white p-3">
      {/* poora card detail kholta hai; andar ke buttons z-10 se alag */}
      <Link href={ROUTES.equipment(item.id)} className="absolute inset-0 rounded-2xl" aria-label={item.name} />

      <div className="flex gap-3">
        <div className="relative h-[84px] w-[96px] shrink-0 overflow-hidden rounded-xl bg-[#f2f3f5]">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- backend URLs, sizes unknown
            <img src={item.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <EquipmentArt kind={item.art} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate pt-0.5 text-[15px] font-bold text-navy-950">{item.name}</h3>
            <button
              type="button"
              aria-label={`Unlike ${item.name}`}
              onClick={onRemove}
              className="relative z-10 -mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition active:scale-90"
            >
              <HeartIcon />
            </button>
          </div>
          <p className="truncate text-[12px] text-slate-500">
            <span className="font-semibold text-navy-950">
              <span className="text-amber-brand">★</span> {item.rating}
            </span>{" "}
            · {item.distanceKm} km · {item.area.split(",")[0]}
          </p>
          <p className="mt-1 text-[14px] text-navy-950">
            <b className="font-bold">{formatINR(item.pricePerHour)}</b>
            <span className="text-[12px] text-slate-500">/hr · </span>
            <b className="font-bold">{formatINR(item.pricePerDay)}</b>
            <span className="text-[12px] text-slate-500">/day</span>
          </p>
          {drop > 0 && (
            <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              ↓ {formatINR(drop)}/day cheaper since you liked it
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className={`flex min-w-0 items-center gap-1.5 text-[12px] font-medium ${status.free ? "text-emerald-700" : "text-slate-500"}`}>
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.free ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className="truncate">{status.text}</span>
        </span>
        <div className="relative z-10 flex shrink-0 gap-2">
          <a
            href={`tel:${item.vendor.phone}`}
            aria-label={`Call ${item.vendor.name}`}
            className="flex h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3.5 text-[13px] font-semibold text-navy-950 transition active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
            Call
          </a>
          {item.available && (
            <Link
              href={ROUTES.book(item.id)}
              className="flex h-9 items-center rounded-full bg-navy-950 px-4 text-[13px] font-semibold text-white transition active:scale-95"
            >
              Book now
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

// Footer ka "Liked" tab — ❤️ wali machines (home card / detail page se)
export default function SavedList() {
  const saved = useSaved();
  const now = useNowMinute();
  const [category, setCategory] = useState("all");
  const [removed, setRemoved] = useState<{ item: SavedItem; index: number; name: string }>();

  useEffect(() => {
    if (!removed) return;
    const t = setTimeout(() => setRemoved(undefined), UNDO_MS);
    return () => clearTimeout(t);
  }, [removed]);

  if (!saved || now === null) {
    return (
      <div className="space-y-3 px-4 pt-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[160px] animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  const today = new Date(now);
  // Purani / hata di gayi machines (data me nahi) chhod do
  const rows = saved.flatMap((s, index) => {
    const item = getEquipment(s.id);
    return item ? [{ saved: s, item, index }] : [];
  });
  const categories = [...new Set(rows.map((r) => r.item.category))];
  const active = categories.includes(category) ? category : "all";
  const visible = active === "all" ? rows : rows.filter((r) => r.item.category === active);

  const remove = (row: (typeof rows)[number]) => {
    haptic("light");
    unsaveItem(row.item.id);
    setRemoved({ item: row.saved, index: row.index, name: row.item.name });
  };

  return (
    <div className="px-4 pb-8 pt-4">
      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white px-6 py-10 text-center">
          <div className="mx-auto h-[88px] w-[140px] overflow-hidden rounded-xl">
            <EquipmentArt kind="excavator" />
          </div>
          <p className="mt-4 text-[16px] font-semibold text-navy-950">No liked machines yet</p>
          <p className="mx-auto mt-1 max-w-[260px] text-[13px] text-slate-500">
            Tap the ♡ on any machine to keep it here and compare rates later.
          </p>
          <Link href={ROUTES.search()} className="mt-5 inline-flex h-10 items-center rounded-xl bg-navy-950 px-5 text-[14px] font-semibold text-white">
            Browse equipment
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-[13px] text-slate-500">
              {rows.length} liked machine{rows.length === 1 ? "" : "s"}
            </p>
          </div>
          {categories.length > 1 && (
            <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              {["all", ...categories].map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={c === active}
                  onClick={() => setCategory(c)}
                  className={`h-8 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition ${
                    c === active ? "border-navy-950 bg-navy-950 text-white" : "border-slate-200 bg-white text-navy-950"
                  }`}
                >
                  {c === "all" ? "All" : categoryLabel(c)}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-3">
            {visible.map((row) => (
              <SavedCard key={row.item.id} item={row.item} saved={row.saved} today={today} onRemove={() => remove(row)} />
            ))}
          </div>
        </>
      )}

      {removed && (
        <div className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-3 rounded-xl bg-navy-950 px-4 py-3 text-white shadow-lg animate-rise">
          <span className="min-w-0 truncate text-[13px]">Removed {removed.name}</span>
          <button
            type="button"
            onClick={() => {
              restoreItem(removed.item, removed.index);
              setRemoved(undefined);
            }}
            className="shrink-0 text-[13px] font-bold text-amber-brand"
          >
            UNDO
          </button>
        </div>
      )}
    </div>
  );
}

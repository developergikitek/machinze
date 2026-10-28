"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Group, Row } from "@/components/equipment/Group";
import { BookingDraft, draftKey, machinesLabel } from "@/lib/bookingDraft";
import { Equipment, formatINR } from "@/lib/equipment";
import {
  EXTENDED_SHIFT_HOURS,
  MAX_HOURS,
  MIN_HOURS,
  plural,
  quoteDays,
  quoteHours,
  STANDARD_SHIFT_HOURS,
} from "@/lib/pricing";
import { ROUTES } from "@/lib/routes";
import { writeStored } from "@/lib/useStoredValue";

import { addDays, formatDay, toISODate } from "@/lib/dates";
import EquipmentSummary from "./EquipmentSummary";
import RangeCalendar from "./RangeCalendar";

type Mode = "days" | "hours";

const SLOTS = ["7–9 AM", "9–11 AM", "12–2 PM", "3–5 PM"];

const noopSubscribe = () => () => {};

// "Aaj" sirf client pe pata hai (page prerender hota hai)
function useToday() {
  const key = useSyncExternalStore(noopSubscribe, () => new Date().toDateString(), () => null);
  return useMemo(() => (key ? new Date(key) : null), [key]);
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { key: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-flow-col auto-cols-fr gap-1 rounded-xl bg-[#eceef2] p-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={o.key === value}
          onClick={() => onChange(o.key)}
          className={`rounded-lg py-2 text-center transition ${o.key === value ? "bg-white shadow-[0_1px_2px_rgba(11,20,55,0.12)]" : ""}`}
        >
          <span className={`block text-[14px] font-semibold ${o.key === value ? "text-navy-950" : "text-slate-500"}`}>{o.label}</span>
          {o.hint && <span className="block text-[11px] text-slate-500">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

export default function BookingFlow({ item }: { item: Equipment }) {
  const router = useRouter();
  const today = useToday();
  const firstFree = Math.max(0, item.availability.indexOf(true));

  const [mode, setMode] = useState<Mode>("days");
  const [start, setStart] = useState<number | null>(firstFree);
  const [end, setEnd] = useState<number | null>(null);
  const [shift, setShift] = useState(STANDARD_SHIFT_HOURS);
  const [hours, setHours] = useState(MIN_HOURS);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [withOperator, setWithOperator] = useState(item.operatorPerDay > 0);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState<string>();
  const [showBreakup, setShowBreakup] = useState(false);

  // TODO: availability API se lambi range — abhi item.availability (agle 7 din), baaki free
  const isBooked = (off: number) => item.availability[off] === false;

  const pick = (off: number) => {
    setNotice(undefined);
    if (mode === "hours" || start === null || end !== null || off < start) {
      setStart(off);
      setEnd(null);
      return;
    }
    if (off === start) return;
    for (let d = start; d <= off; d++) {
      if (isBooked(d)) {
        setStart(off);
        setEnd(null);
        setNotice("Selected range had a booked day — start date moved. Pick an end date again.");
        return;
      }
    }
    setEnd(off);
  };

  const changeMode = (m: Mode) => {
    setMode(m);
    setEnd(null);
    setNotice(undefined);
  };

  const days = start === null ? 0 : (end ?? start) - start + 1;
  const quote =
    mode === "days" ? quoteDays(item, days, shift, withOperator, quantity) : quoteHours(item, hours, withOperator, quantity);
  const ready = !!today && start !== null;
  const startDate = today && start !== null ? addDays(today, start) : null;
  const endDate = today && start !== null ? addDays(today, end ?? start) : null;

  // Quantity bhi isi me — delivery, review, bookings sab jagah yahi label dikhta hai
  const durationLabel = [
    quantity > 1 && machinesLabel(quantity),
    mode === "days" ? `${plural(days, "day")} · ${shift} hr/day` : plural(hours, "hour"),
  ]
    .filter(Boolean)
    .join(" · ");

  const next = () => {
    if (!startDate || !endDate) return;
    const draft: BookingDraft = {
      equipmentId: item.id,
      quantity,
      mode,
      startDate: toISODate(startDate),
      endDate: toISODate(mode === "days" ? endDate : startDate),
      hours,
      shiftHours: shift,
      slot,
      withOperator,
      durationLabel,
      total: quote.total,
    };
    writeStored("session", draftKey(item.id), draft);
    router.push(ROUTES.bookDelivery(item.id));
  };

  return (
    <div className="space-y-6 px-4 pb-6 pt-3">
      <EquipmentSummary item={item} />

      <Group label="Machines" footer={item.units > 1 ? `${item.units} available with this vendor` : "Only 1 available with this vendor"}>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[14px] text-slate-600">How many do you need?</span>
          <div className="flex items-center gap-3">
            {[
              ["Fewer machines", -1, "−"],
              ["More machines", 1, "+"],
            ].map(([label, step, sign], i) => (
              <button
                key={label as string}
                type="button"
                aria-label={label as string}
                disabled={step === -1 ? quantity <= 1 : quantity >= item.units}
                onClick={() => setQuantity((q) => q + (step as number))}
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-[18px] font-semibold text-navy-950 transition active:scale-90 disabled:opacity-30 ${i ? "order-3" : "order-1"}`}
              >
                {sign}
              </button>
            ))}
            <span className="order-2 min-w-[32px] text-center text-[16px] font-semibold tabular-nums text-navy-950">{quantity}</span>
          </div>
        </div>
      </Group>

      <Segmented
        label="Booking type"
        value={mode}
        onChange={changeMode}
        options={[
          { key: "days", label: "By day" },
          { key: "hours", label: "By hour" },
        ]}
      />

      <Group
        label={mode === "days" ? "Dates" : "Date"}
        footer={mode === "days" ? "Tap a start date, then an end date. Single tap = 1 day." : undefined}
      >
        <div className="px-3 py-4">
          {today ? (
            <RangeCalendar today={today} start={start} end={mode === "days" ? end : null} isBooked={isBooked} onPick={pick} />
          ) : (
            <div className="h-[330px] animate-pulse rounded-xl bg-slate-100" />
          )}
          {notice && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-800">{notice}</p>}
        </div>
      </Group>

      {mode === "days" ? (
        <Group label="Shift per day">
          <div className="p-3">
            <Segmented
              label="Shift length"
              value={String(shift)}
              onChange={(v) => setShift(Number(v))}
              options={[
                { key: String(STANDARD_SHIFT_HOURS), label: `${STANDARD_SHIFT_HOURS} hours`, hint: "Standard" },
                { key: String(EXTENDED_SHIFT_HOURS), label: `${EXTENDED_SHIFT_HOURS} hours`, hint: "+50% rate" },
              ]}
            />
          </div>
        </Group>
      ) : (
        <Group label="Hours">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[14px] text-slate-600">Min {MIN_HOURS} · max {MAX_HOURS}</span>
            <div className="flex items-center gap-3">
              {[
                ["Decrease hours", -1, "−"],
                ["Increase hours", 1, "+"],
              ].map(([label, step, sign], i) => (
                <button
                  key={label as string}
                  type="button"
                  aria-label={label as string}
                  disabled={step === -1 ? hours <= MIN_HOURS : hours >= MAX_HOURS}
                  onClick={() => setHours((h) => h + (step as number))}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-[18px] font-semibold text-navy-950 transition active:scale-90 disabled:opacity-30 ${i ? "order-3" : "order-1"}`}
                >
                  {sign}
                </button>
              ))}
              <span className="order-2 min-w-[64px] text-center text-[15px] font-semibold tabular-nums text-navy-950">{plural(hours, "hr")}</span>
            </div>
          </div>
        </Group>
      )}

      <Group label="Delivery slot" footer="Machine reaches your site in this window on the start date.">
        <div className="grid grid-cols-4 gap-1.5 p-3">
          {SLOTS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === slot}
              onClick={() => setSlot(s)}
              className={`rounded-lg border py-2 text-[12px] font-medium transition ${
                s === slot ? "border-navy-950 bg-navy-950 text-white" : "border-slate-200 text-navy-950"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Group>

      {item.operatorPerDay > 0 ? (
        <Group>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[14px] font-medium text-navy-950">{quantity > 1 ? `Add ${quantity} operators` : "Add operator"}</p>
              <p className="text-[12px] text-slate-500">
                Trained operator{quantity > 1 && " for each machine"} · {formatINR(item.operatorPerDay)}/day each
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={withOperator}
              aria-label="Add operator"
              onClick={() => setWithOperator((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition ${withOperator ? "bg-navy-950" : "bg-slate-300"}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${withOperator ? "left-6" : "left-1"}`} />
            </button>
          </div>
        </Group>
      ) : (
        <Group>
          <Row label="Operator" value="Included" />
        </Group>
      )}

      <Group label="Summary">
        <Row label="Start" value={startDate ? `${formatDay(startDate)}, ${slot.split("–")[0]}${slot.endsWith("PM") ? " PM" : " AM"}` : "—"} />
        {mode === "days" && <Row label="End" value={endDate ? formatDay(endDate) : "—"} />}
        <Row
          label="Duration"
          value={durationLabel}
          hint={mode === "days" && days >= 7 ? "Weekly rate applied" : undefined}
        />
        <button type="button" onClick={() => setShowBreakup((v) => !v)} className="flex w-full items-center justify-between px-4 py-3">
          <span className="text-[14px] text-slate-600">Estimated total</span>
          <span className="flex items-center gap-1.5 text-[14px] font-semibold text-navy-950">
            {formatINR(quote.total)}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={`text-slate-400 transition ${showBreakup ? "rotate-180" : ""}`} aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        {showBreakup && (
          <dl className="space-y-1.5 border-t border-slate-100 bg-[#fafbfc] px-4 py-3 text-[13px]">
            {[
              [`Rent · ${quote.rentLabel}`, quote.rent],
              ["Operator", quote.operator],
              ["Delivery & pickup", quote.delivery],
              ["GST (18%)", quote.gst],
            ]
              .filter(([, v]) => v)
              .map(([label, v]) => (
                <div key={label} className="flex justify-between gap-3 text-slate-600">
                  <dt>{label}</dt>
                  <dd className="text-navy-950">{formatINR(v as number)}</dd>
                </div>
              ))}
          </dl>
        )}
      </Group>
      <p className="-mt-3 px-1 text-[12px] text-slate-500">
        + {formatINR(item.deposit * quantity)} refundable deposit at delivery · Free cancellation up to 6 hr before start
      </p>

      {/* sticky bottom */}
      <div aria-hidden className="h-[72px]" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-bold tracking-tight text-navy-950">{formatINR(quote.total)}</p>
            <p className="truncate text-[12px] text-slate-500">
              {quantity > 1 && `${machinesLabel(quantity)} · `}
              {mode === "days" ? plural(days, "day") : plural(hours, "hour")} · incl. GST
            </p>
          </div>
          <button
            type="button"
            disabled={!ready}
            onClick={next}
            className="h-[50px] rounded-2xl bg-navy-950 px-8 text-[16px] font-semibold text-white transition active:scale-[0.97] disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Group, Row } from "@/components/equipment/Group";
import { addressTitle } from "@/lib/addresses";
import { ADVANCE_RATE, BookingDraft, draftKey, FREE_CANCEL_HOURS, quantityOf, slotStartHour } from "@/lib/bookingDraft";
import { BOOKINGS_KEY, ConfirmedBooking, newBookingId, PayPlan } from "@/lib/bookingsStore";
import { Equipment, formatINR } from "@/lib/equipment";
import { quoteDraft } from "@/lib/pricing";
import { ROUTES } from "@/lib/routes";
import { useNowMinute } from "@/lib/useNow";
import { readStored, useStoredRaw, writeStored } from "@/lib/useStoredValue";

import { formatDay, fromISODate } from "@/lib/dates";
import EquipmentSummary from "./EquipmentSummary";

function EditLink({ href }: { href: string }) {
  return (
    <Link href={href} className="text-[13px] font-semibold text-navy-950 underline underline-offset-2">
      Edit
    </Link>
  );
}

export default function ReviewConfirm({ item }: { item: Equipment }) {
  const router = useRouter();
  const raw = useStoredRaw("session", draftKey(item.id));
  const draft = useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as BookingDraft) : null;
    } catch {
      return null;
    }
  }, [raw]);
  const [plan, setPlan] = useState<PayPlan>("full");
  const [agreed, setAgreed] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [paying, setPaying] = useState(false);
  const now = useNowMinute();

  if (raw === undefined) return <div className="m-4 h-[480px] animate-pulse rounded-2xl bg-white" />;

  if (!draft?.delivery) {
    const toDates = !draft;
    return (
      <div className="m-4 rounded-2xl bg-white p-6 text-center">
        <p className="text-[16px] font-semibold text-navy-950">{toDates ? "Pick your dates first" : "Add a delivery address"}</p>
        <p className="mt-1 text-[13px] text-slate-500">A few details are missing before you can review.</p>
        <Link
          href={toDates ? ROUTES.book(item.id) : ROUTES.bookDelivery(item.id)}
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-navy-950 px-5 text-[14px] font-semibold text-white"
        >
          {toDates ? "Select dates" : "Add address"}
        </Link>
      </div>
    );
  }

  const start = fromISODate(draft.startDate);
  const end = fromISODate(draft.endDate);
  // Draft ka total nahi, yahan dobara hisaab — sab steps ek hi pricing se
  const quote = quoteDraft(item, draft);
  const quantity = quantityOf(draft);
  const advance = Math.round(quote.total * ADVANCE_RATE);
  const payNow = plan === "full" ? quote.total : advance;

  const cancelBy = new Date(start);
  cancelBy.setHours(slotStartHour(draft.slot) - FREE_CANCEL_HOURS, 0, 0, 0);
  const cancelByLabel = `${formatDay(cancelBy)}, ${cancelBy.toLocaleTimeString("en-IN", { hour: "numeric", hour12: true })}`;
  const freeCancel = now === null || cancelBy.getTime() > now;

  const when = draft.startDate === draft.endDate ? formatDay(start) : `${formatDay(start)} – ${formatDay(end)}`;
  const d = draft.delivery;

  const pay = () => {
    // TODO: payment gateway (order create → checkout → verify) + booking API
    setPaying(true);
    setTimeout(() => {
      const booking: ConfirmedBooking = {
        id: newBookingId(),
        equipmentId: item.id,
        createdAt: new Date().toISOString(),
        draft: { ...draft, total: quote.total },
        plan,
        total: quote.total,
        paidNow: payNow,
      };
      const existing = readStored<ConfirmedBooking[]>("local", BOOKINGS_KEY) ?? [];
      writeStored("local", BOOKINGS_KEY, [booking, ...existing]);
      router.replace(ROUTES.bookingConfirmed(booking.id));
    }, 1200);
  };

  return (
    <div className="space-y-6 px-4 pb-6 pt-3">
      <EquipmentSummary item={item} />

      <Group label="Booking">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[12px] text-slate-500">When</p>
            <p className="text-[14px] font-medium text-navy-950">{when}</p>
            <p className="text-[12px] text-slate-500">
              {draft.durationLabel} · delivery {draft.slot}
            </p>
          </div>
          <EditLink href={ROUTES.book(item.id)} />
        </div>
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[12px] text-slate-500">Where</p>
            <p className="truncate text-[14px] font-medium text-navy-950">{addressTitle(d)}</p>
            <p className="text-[12px] leading-snug text-slate-500">
              {d.address}
              {d.landmark && `, ${d.landmark}`} · {d.pincode}
            </p>
            <p className="mt-1 text-[12px] text-slate-500">
              Site contact: {d.contactName} · +91 {d.contactPhone}
            </p>
          </div>
          <EditLink href={ROUTES.bookDelivery(item.id)} />
        </div>
        <Row label="Machines" value={quantity} />
        <Row
          label={quantity > 1 ? "Operators" : "Operator"}
          value={item.operatorPerDay === 0 ? "Included" : draft.withOperator ? (quantity > 1 ? `${quantity} added` : "Added") : "Not added"}
        />
        {draft.notes && <Row label="Driver notes" value={<span className="line-clamp-2 font-normal">{draft.notes}</span>} />}
      </Group>

      <Group label="Payment">
        <Row label={`Rent · ${quote.rentLabel}`} value={formatINR(quote.rent)} />
        {quote.operator > 0 && <Row label="Operator" value={formatINR(quote.operator)} />}
        <Row label="Delivery & pickup" value={formatINR(quote.delivery)} />
        <Row label="GST (18%)" value={formatINR(quote.gst)} />
        <div className="flex items-center justify-between bg-[#fafbfc] px-4 py-3.5">
          <span className="text-[15px] font-semibold text-navy-950">Total</span>
          <span className="text-[18px] font-bold tracking-tight text-navy-950">{formatINR(quote.total)}</span>
        </div>
      </Group>
      <p className="-mt-3 px-1 text-[12px] text-slate-500">
        + {formatINR(item.deposit * quantity)} refundable security deposit{quantity > 1 && ` (${formatINR(item.deposit)} × ${quantity})`}, paid to the operator at delivery.
      </p>

      <Group label="How do you want to pay?">
        {(
          [
            ["full", "Pay in full", formatINR(quote.total), "Nothing to pay later"],
            ["advance", `Pay ${ADVANCE_RATE * 100}% advance`, formatINR(advance), `${formatINR(quote.total - advance)} at delivery`],
          ] as const
        ).map(([key, title, amount, hint]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={plan === key}
            onClick={() => setPlan(key)}
            className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0"
          >
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${plan === key ? "border-navy-950" : "border-slate-300"}`}>
              {plan === key && <span className="h-2.5 w-2.5 rounded-full bg-navy-950" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-navy-950">{title}</span>
              <span className="block text-[12px] text-slate-500">{hint}</span>
            </span>
            <span className="text-[14px] font-semibold text-navy-950">{amount}</span>
          </button>
        ))}
      </Group>

      <div className={`flex items-start gap-3 rounded-2xl px-4 py-3 ${freeCancel ? "bg-emerald-50" : "bg-amber-50"}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={freeCancel ? "#047857" : "#b45309"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden>
          <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        {freeCancel ? (
          <p className="text-[13px] leading-snug text-emerald-800">
            <b className="font-semibold">Free cancellation until {cancelByLabel}.</b> Full refund to your original payment method.
          </p>
        ) : (
          <p className="text-[13px] leading-snug text-amber-800">
            <b className="font-semibold">Starts within {FREE_CANCEL_HOURS} hours.</b> If you cancel, the delivery charge is non-refundable.
          </p>
        )}
      </div>

      <div>
        <label className="flex items-start gap-3 px-1 text-[14px] leading-snug text-navy-950">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-navy-950" />
          <span>
            I agree to the rental terms and cancellation policy.{" "}
            <button type="button" onClick={() => setShowPolicy((v) => !v)} className="font-semibold underline underline-offset-2">
              {showPolicy ? "Hide" : "View"}
            </button>
          </span>
        </label>
        {showPolicy && (
          <ul className="mt-3 list-disc space-y-1.5 rounded-2xl bg-white px-8 py-4 text-[13px] leading-snug text-slate-600">
            <li>Free cancellation up to {FREE_CANCEL_HOURS} hours before the delivery slot. After that, the delivery charge is non-refundable.</li>
            <li>The machine must be used only at the delivery site and within the booked shift hours.</li>
            <li>Damage beyond normal wear is adjusted from the security deposit after inspection.</li>
            <li>Fuel after the first fill is charged at actuals.</li>
          </ul>
        )}
      </div>

      {/* sticky bottom */}
      <div aria-hidden className="h-[80px]" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          disabled={!agreed || paying}
          onClick={pay}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-navy-950 text-[16px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
        >
          {paying ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" />
                <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
              </svg>
              Pay {formatINR(payNow)}
            </>
          )}
        </button>
        <p className="mt-1.5 text-center text-[11px] text-slate-400">
          {agreed ? "Secure, encrypted payment" : "Accept the terms to continue"}
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CSSProperties, useEffect, useMemo, useState } from "react";

import { Group, Row } from "@/components/equipment/Group";
import { addressTitle } from "@/lib/addresses";
import { draftKey, quantityOf, SUPPORT_PHONE } from "@/lib/bookingDraft";
import { BookingStatus, bookingStatus, cancelDeadline, refundFor } from "@/lib/bookingsStore";
import { formatDay, fromISODate } from "@/lib/dates";
import { formatINR, getEquipment } from "@/lib/equipment";
import { haptic } from "@/lib/native";
import { quoteDraft } from "@/lib/pricing";
import { ROUTES } from "@/lib/routes";
import { updateBooking, useBookings } from "@/lib/useBookings";
import { writeStored } from "@/lib/useStoredValue";

import StatusPill from "./StatusPill";

const BURST = ["#f5a91b", "#111c4e", "#10b981", "#ffcb45", "#1a2766", "#10b981"];

// Ring + checkmark draw + chhota burst (styles: app/fx.css)
function SuccessMark() {
  return (
    <div className="relative mx-auto h-20 w-20">
      <div className="fx-success-burst absolute inset-0" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ "--a": `${i * 30}deg`, background: BURST[i % BURST.length] } as CSSProperties} />
        ))}
      </div>
      <svg viewBox="0 0 64 64" className="relative h-20 w-20" aria-hidden>
        <circle cx="32" cy="32" r="30" fill="#ecfdf5" />
        <circle className="fx-success-ring" cx="32" cy="32" r="30" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" transform="rotate(-90 32 32)" />
        <path className="fx-success-check" d="M20 33l8 8 16-17" fill="none" stroke="#047857" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

const STATUS_LINE: Record<BookingStatus, (p: { start: string; end: string; slot: string }) => string> = {
  upcoming: ({ start, slot }) => `Arrives ${start}, ${slot}`,
  ongoing: ({ end }) => `On site until ${end}`,
  completed: ({ end }) => `Completed on ${end}`,
  cancelled: () => "This booking was cancelled",
};

type Step = { title: string; text: string; state: "done" | "current" | "next" };

function timeline(
  status: BookingStatus,
  t: { bookedAt: string; vendor: string; contact: string; delivery: string; end: string },
): Step[] {
  if (status === "ongoing")
    return [
      { title: "Booking confirmed", text: t.bookedAt, state: "done" },
      { title: "Delivered at site", text: t.delivery, state: "done" },
      { title: "Working on site", text: `Until ${t.end}`, state: "current" },
      { title: "Pickup", text: `After the last shift on ${t.end}`, state: "next" },
    ];
  if (status === "completed")
    return [
      { title: "Booking confirmed", text: t.bookedAt, state: "done" },
      { title: "Delivered at site", text: t.delivery, state: "done" },
      { title: "Picked up", text: t.end, state: "done" },
    ];
  return [
    { title: "Booking confirmed", text: t.bookedAt, state: "done" },
    { title: "Machine & operator assigned", text: t.vendor, state: "current" },
    { title: "Driver calls your site", text: t.contact, state: "next" },
    { title: "Delivered at site", text: t.delivery, state: "next" },
  ];
}

const chevron = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

type Props = {
  // confirmed = payment ke turant baad; view = My bookings se
  variant: "confirmed" | "view";
};

export default function BookingView({ variant }: Props) {
  const id = useSearchParams().get("id") ?? "";
  const { bookings, now, todayISO } = useBookings();
  const booking = useMemo(() => bookings?.find((b) => b.id === id) ?? null, [bookings, id]);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showBreakup, setShowBreakup] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const item = booking ? getEquipment(booking.equipmentId) : null;

  // Booking ho gayi — draft hatao, taaki back karke Delivery/Review se dobara pay na ho
  const bookedEquipment = variant === "confirmed" ? booking?.equipmentId : undefined;
  useEffect(() => {
    if (!bookedEquipment) return;
    writeStored("session", draftKey(bookedEquipment), null);
    haptic("success");
  }, [bookedEquipment]);

  if (bookings === undefined || !todayISO || now === null) {
    return <div className="m-4 h-[520px] animate-pulse rounded-2xl bg-white" />;
  }

  if (!booking || !item) {
    return (
      <div className="m-4 rounded-2xl bg-white p-6 text-center">
        <p className="text-[16px] font-semibold text-navy-950">Booking not found</p>
        <p className="mt-1 text-[13px] text-slate-500">It may have been made on another device.</p>
        <Link href={ROUTES.bookings} className="mt-4 inline-flex h-10 items-center rounded-xl bg-navy-950 px-5 text-[14px] font-semibold text-white">
          My bookings
        </Link>
      </div>
    );
  }

  const { draft } = booking;
  const d = draft.delivery!;
  const start = fromISODate(draft.startDate);
  const end = fromISODate(draft.endDate);
  const when = draft.startDate === draft.endDate ? formatDay(start) : `${formatDay(start)} – ${formatDay(end)}`;
  const quote = quoteDraft(item, draft);
  const quantity = quantityOf(draft);
  // "2 × JCB 3DX Excavator"
  const itemName = quantity > 1 ? `${quantity} × ${item.name}` : item.name;
  const due = booking.total - booking.paidNow;
  const bookedAt = new Date(booking.createdAt);
  const bookedAtLabel = `${bookedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${bookedAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;

  const status = bookingStatus(booking, todayISO);
  const deadline = cancelDeadline(booking);
  const refund = refundFor(booking, item, now);
  const freeCancel = now < deadline.getTime();

  const steps = timeline(status, {
    bookedAt: bookedAtLabel,
    vendor: `${item.vendor.name} usually confirms in ~${item.vendor.responseMins} min`,
    contact: `${d.contactName} · +91 ${d.contactPhone}`,
    delivery: `${formatDay(start)}, ${draft.slot}`,
    end: formatDay(end),
  });

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(booking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const share = async () => {
    const text = `Machinze booking ${booking.id}: ${itemName}, ${when} (${draft.slot}) at ${addressTitle(d)}.`;
    try {
      if (navigator.share) await navigator.share({ title: `Booking ${booking.id}`, text });
      else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 1500);
      }
    } catch {
      // user ne cancel kiya
    }
  };

  const cancel = () => {
    // TODO: cancel API + refund
    updateBooking(booking.id, { cancelledAt: new Date(now).toISOString(), refund });
    haptic("warning");
    setConfirmCancel(false);
  };

  return (
    <div className={`space-y-6 px-4 pb-6 ${variant === "confirmed" ? "pt-8" : "pt-4"}`}>
      {variant === "confirmed" ? (
        <section className="text-center">
          <SuccessMark />
          <h1 className="mt-4 text-[22px] font-semibold tracking-tight text-navy-950">Booking confirmed</h1>
          <p className="mx-auto mt-1 max-w-[290px] text-[14px] text-slate-500">
            {itemName} {quantity > 1 ? "arrive" : "arrives"} on {formatDay(start)}, <span className="whitespace-nowrap">{draft.slot}</span>.
          </p>
        </section>
      ) : (
        <section>
          <StatusPill status={status} />
          <p className="mt-2 text-[14px] text-slate-600">{STATUS_LINE[status]({ start: formatDay(start), end: formatDay(end), slot: draft.slot })}</p>
        </section>
      )}

      <div className="rounded-2xl bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-[12px] text-slate-500">Booking ID</p>
            <p className="text-[17px] font-semibold tracking-wide text-navy-950">#{booking.id}</p>
          </div>
          <button
            type="button"
            onClick={copyId}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#f2f3f5] px-3 text-[13px] font-medium text-navy-950 transition active:scale-95"
          >
            {copied ? (
              "Copied"
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <rect x="8" y="8" width="12" height="12" rx="2.5" />
                  <path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <Link href={ROUTES.equipment(item.id)} className="flex items-center gap-3 px-4 py-3">
          <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f2f3f5]">
            {item.image && (
              // eslint-disable-next-line @next/next/no-img-element -- backend URLs, sizes unknown
              <img src={item.image} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-navy-950">{itemName}</p>
            <p className="truncate text-[12px] text-slate-500">
              {when} · {draft.durationLabel}
            </p>
            <p className="truncate text-[12px] text-slate-500">
              {addressTitle(d)} · {d.pincode}
            </p>
          </div>
        </Link>
      </div>

      {status === "cancelled" ? (
        <Group label="Cancellation">
          <Row label="Cancelled on" value={booking.cancelledAt ? formatDay(new Date(booking.cancelledAt)) : "—"} />
          <Row label="Refund" value={formatINR(booking.refund ?? 0)} hint={booking.refund ? "To original payment method · 5–7 days" : undefined} />
        </Group>
      ) : (
        <Group label={status === "completed" ? "Timeline" : "What happens next"}>
          <ol className="px-4 py-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative flex gap-3 pb-5 last:pb-0">
                {i < steps.length - 1 && (
                  <span className={`absolute left-[9px] top-6 h-[calc(100%-20px)] w-0.5 ${s.state === "done" ? "bg-emerald-500" : "bg-slate-200"}`} />
                )}
                <span
                  className={`relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    s.state === "done" ? "bg-emerald-500" : s.state === "current" ? "border-2 border-amber-brand bg-white" : "border-2 border-slate-200 bg-white"
                  }`}
                >
                  {s.state === "done" && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  )}
                  {s.state === "current" && <span className="h-2 w-2 animate-pulse rounded-full bg-amber-brand motion-reduce:animate-none" />}
                </span>
                <div className="min-w-0">
                  <p className={`text-[14px] font-medium ${s.state === "next" ? "text-slate-500" : "text-navy-950"}`}>{s.title}</p>
                  <p className="truncate text-[12px] text-slate-500">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Group>
      )}

      <Group label="Payment">
        <Row label="Total" value={formatINR(booking.total)} />
        <Row
          label="Paid now"
          value={
            <span className="flex items-center justify-end gap-2">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Paid</span>
              {formatINR(booking.paidNow)}
            </span>
          }
        />
        {due > 0 && status !== "cancelled" && (
          <Row label={status === "upcoming" ? "Due at delivery" : "Paid at delivery"} value={formatINR(due)} />
        )}
        {status !== "cancelled" && <Row label="Security deposit" value={formatINR(item.deposit * quantity)} hint="At delivery · refundable" />}
        <button type="button" onClick={() => setShowBreakup((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-[13px] font-medium text-navy-950">
          {showBreakup ? "Hide breakdown" : "View breakdown"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={`text-slate-400 transition ${showBreakup ? "rotate-180" : ""}`} aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
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

      {variant === "view" && status === "upcoming" && (
        <div className="rounded-2xl bg-white p-4">
          {confirmCancel ? (
            <>
              <p className="text-[15px] font-semibold text-navy-950">Cancel this booking?</p>
              <p className="mt-1 text-[13px] leading-snug text-slate-500">
                {freeCancel
                  ? `You'll get the full ${formatINR(refund)} back.`
                  : `The delivery charge is non-refundable now. You'll get ${formatINR(refund)} back.`}{" "}
                Refunds reach your original payment method in 5–7 days.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setConfirmCancel(false)} className="h-11 rounded-xl border border-slate-200 text-[14px] font-semibold text-navy-950">
                  Keep booking
                </button>
                <button type="button" onClick={cancel} className="h-11 rounded-xl bg-red-600 text-[14px] font-semibold text-white">
                  Yes, cancel
                </button>
              </div>
            </>
          ) : (
            <button type="button" onClick={() => setConfirmCancel(true)} className="flex w-full items-center justify-between text-left">
              <span>
                <span className="block text-[14px] font-medium text-red-600">Cancel booking</span>
                <span className="block text-[12px] text-slate-500">
                  {freeCancel
                    ? `Free until ${formatDay(deadline)}, ${deadline.toLocaleTimeString("en-IN", { hour: "numeric", hour12: true })}`
                    : "Delivery charge is non-refundable now"}
                </span>
              </span>
              {chevron}
            </button>
          )}
        </div>
      )}

      <Group>
        <button type="button" onClick={share} className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy-950" aria-hidden>
            <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5v6A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-6" />
          </svg>
          <span className="flex-1 text-[14px] font-medium text-navy-950">{shared ? "Booking details copied" : "Share booking details"}</span>
        </button>
        <a href={`tel:${SUPPORT_PHONE}`} className="flex w-full items-center gap-3 px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy-950" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.2a2.6 2.6 0 0 1 5 .8c0 1.7-2.5 2.2-2.5 3.8M12 17h.01" />
          </svg>
          <span className="flex-1 text-[14px] font-medium text-navy-950">Need help? Call support</span>
        </a>
      </Group>

      {variant === "confirmed" ? (
        <div className="grid grid-cols-2 gap-3">
          <Link href={ROUTES.bookings} replace className="flex h-[50px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-[15px] font-semibold text-navy-950 transition active:scale-[0.98]">
            My bookings
          </Link>
          <Link href={ROUTES.home} replace className="flex h-[50px] items-center justify-center rounded-2xl bg-navy-950 text-[15px] font-semibold text-white transition active:scale-[0.98]">
            Back to home
          </Link>
        </div>
      ) : (
        (status === "completed" || status === "cancelled") && (
          <Link href={ROUTES.equipment(item.id)} className="flex h-[50px] items-center justify-center rounded-2xl bg-navy-950 text-[15px] font-semibold text-white transition active:scale-[0.98]">
            Book again
          </Link>
        )
      )}
    </div>
  );
}

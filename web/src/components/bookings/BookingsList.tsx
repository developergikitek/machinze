"use client";

import Link from "next/link";
import { useState } from "react";

import { SUPPORT_PHONE } from "@/lib/bookingDraft";
import { BookingStatus, bookingStatus } from "@/lib/bookingsStore";
import { ROUTES } from "@/lib/routes";
import { useBookings } from "@/lib/useBookings";

import BookingCard from "./BookingCard";

const TABS: { key: BookingStatus; label: string; empty: string }[] = [
  { key: "upcoming", label: "Upcoming", empty: "No upcoming bookings. Machines you book will show up here." },
  { key: "ongoing", label: "Ongoing", empty: "Nothing on site right now." },
  { key: "completed", label: "Completed", empty: "Completed rentals will show up here." },
  { key: "cancelled", label: "Cancelled", empty: "No cancelled bookings." },
];

export default function BookingsList() {
  const { bookings, todayISO } = useBookings();
  const [tab, setTab] = useState<BookingStatus>("upcoming");

  if (!bookings || !todayISO) {
    return (
      <div className="space-y-3 px-4 pt-14">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[168px] animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  const withStatus = bookings.map((b) => ({ booking: b, status: bookingStatus(b, todayISO) }));
  const counts = Object.fromEntries(TABS.map((t) => [t.key, withStatus.filter((x) => x.status === t.key).length]));
  const shown = withStatus
    .filter((x) => x.status === tab)
    // upcoming: jo pehle aa rahi; baaki: naya pehle
    .sort((a, b) =>
      tab === "upcoming"
        ? a.booking.draft.startDate.localeCompare(b.booking.draft.startDate)
        : b.booking.draft.startDate.localeCompare(a.booking.draft.startDate),
    );
  const current = TABS.find((t) => t.key === tab)!;

  return (
    <>
      <div role="tablist" className="sticky top-0 z-20 flex border-b border-slate-200 bg-white px-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === tab}
            onClick={() => setTab(t.key)}
            className={`relative flex h-11 min-w-0 flex-1 items-center justify-center gap-1 text-[13px] font-medium transition ${
              t.key === tab ? "text-navy-950" : "text-slate-400"
            }`}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span className={`rounded-full px-1.5 text-[10px] font-semibold leading-4 ${t.key === tab ? "bg-navy-950 text-white" : "bg-slate-100 text-slate-500"}`}>
                {counts[t.key]}
              </span>
            )}
            {t.key === tab && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-navy-950" />}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="space-y-3 px-4 py-4">
        {shown.length ? (
          shown.map(({ booking, status }) => <BookingCard key={booking.id} booking={booking} status={status} />)
        ) : (
          <div className="rounded-2xl bg-white px-6 py-10 text-center">
            <p className="text-[15px] font-semibold text-navy-950">{current.empty}</p>
            {tab === "upcoming" && (
              <Link href={ROUTES.search()} className="mt-4 inline-flex h-10 items-center rounded-xl bg-navy-950 px-5 text-[14px] font-semibold text-white">
                Browse equipment
              </Link>
            )}
          </div>
        )}

        <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f3f5] text-navy-950">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
              <rect x="3" y="14" width="4" height="6" rx="1.5" />
              <rect x="17" y="14" width="4" height="6" rx="1.5" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-medium text-navy-950">Need help with a booking?</span>
            <span className="block text-[12px] text-slate-500">Call support, 7 AM – 10 PM</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="m9 6 6 6-6 6" />
          </svg>
        </a>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";

import { jakarta } from "@/app/fonts";
import BookingView from "@/components/bookings/BookingView";

export const metadata: Metadata = { title: "Booking confirmed" };

// ?id= client pe padhte hain (useSearchParams) — isliye Suspense
export default function BookingConfirmedPage() {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-[#f5f6f8]`}>
      <Suspense fallback={<div className="m-4 h-[520px] animate-pulse rounded-2xl bg-white" />}>
        <BookingView variant="confirmed" />
      </Suspense>
    </main>
  );
}

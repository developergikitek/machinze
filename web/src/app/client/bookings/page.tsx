import type { Metadata } from "next";

import { jakarta } from "@/app/fonts";
import BookingsList from "@/components/bookings/BookingsList";

export const metadata: Metadata = { title: "My bookings" };

// Header ("My bookings") aur footer tabs native hain
export default function BookingsPage() {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-[#f5f6f8]`}>
      <BookingsList />
    </main>
  );
}

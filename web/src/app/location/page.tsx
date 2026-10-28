import type { Metadata } from "next";
import { Suspense } from "react";

import { jakarta } from "@/app/fonts";
import LocationPicker from "@/components/location/LocationPicker";

export const metadata: Metadata = { title: "Select location" };

// Onboarding ke baad (location na mili ho) aur home header ki location pe tap — ?next= client pe padhte hain
export default function LocationPage() {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-white`}>
      <Suspense>
        <LocationPicker />
      </Suspense>
    </main>
  );
}

import type { Metadata } from "next";

import { jakarta } from "@/app/fonts";
import AddressesList from "@/components/profile/AddressesList";

export const metadata: Metadata = { title: "My addresses" };

export default function AddressesPage() {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-[#f5f6f8]`}>
      <AddressesList />
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { jakarta } from "@/app/fonts";
import BookingFlow from "@/components/booking/BookingFlow";
import PageHeader from "@/components/PageHeader";
import { getEquipment, NEARBY_EQUIPMENT } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Select dates" };

// TODO: backend aane pe bhi kam se kam ek id (Cache Components ki shart)
export function generateStaticParams() {
  return NEARBY_EQUIPMENT.map((e) => ({ id: e.id }));
}

// params Suspense ke andar padhte hain — header turant, form peeche se
async function Flow({ params }: { params: Promise<{ id: string }> }) {
  const item = getEquipment((await params).id);
  if (!item || !item.available) notFound();
  return <BookingFlow item={item} />;
}

export default function BookPage({ params }: PageProps<"/client/book/[id]">) {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-[#f5f6f8]`}>
      <PageHeader title="Select dates" step="Step 1 of 3" fallback={ROUTES.home} />
      <Suspense fallback={<div className="m-4 h-[480px] animate-pulse rounded-2xl bg-white" />}>
        <Flow params={params} />
      </Suspense>
    </main>
  );
}

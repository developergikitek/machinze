import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { jakarta } from "@/app/fonts";
import DeliveryForm from "@/components/booking/DeliveryForm";
import PageHeader from "@/components/PageHeader";
import { getEquipment, NEARBY_EQUIPMENT } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Delivery location" };

export function generateStaticParams() {
  return NEARBY_EQUIPMENT.map((e) => ({ id: e.id }));
}

async function Form({ params }: { params: Promise<{ id: string }> }) {
  const item = getEquipment((await params).id);
  if (!item || !item.available) notFound();
  return <DeliveryForm item={item} />;
}

export default function DeliveryPage({ params }: PageProps<"/client/book/[id]/delivery">) {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-[#f5f6f8]`}>
      <PageHeader title="Delivery location" step="Step 2 of 3" fallback={ROUTES.home} />
      <Suspense fallback={<div className="m-4 h-[480px] animate-pulse rounded-2xl bg-white" />}>
        <Form params={params} />
      </Suspense>
    </main>
  );
}

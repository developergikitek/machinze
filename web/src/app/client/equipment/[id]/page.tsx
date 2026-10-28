import type { Metadata } from "next";
import { Suspense } from "react";

import { jakarta } from "@/app/fonts";
import DetailSkeleton from "@/components/equipment/DetailSkeleton";
import EquipmentDetails from "@/components/equipment/EquipmentDetails";
import { getEquipment, NEARBY_EQUIPMENT } from "@/lib/equipment";

// TODO: backend aane pe bhi kam se kam ek id return karni hai (Cache Components ki shart)
export function generateStaticParams() {
  return NEARBY_EQUIPMENT.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: PageProps<"/client/equipment/[id]">): Promise<Metadata> {
  const item = getEquipment((await params).id);
  return { title: item?.name ?? "Equipment" };
}

export default function EquipmentPage({ params }: PageProps<"/client/equipment/[id]">) {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-[#f5f6f8]`}>
      <Suspense fallback={<DetailSkeleton />}>
        <EquipmentDetails params={params} />
      </Suspense>
    </main>
  );
}

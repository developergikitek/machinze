import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { jakarta } from "@/app/fonts";
import ReviewConfirm from "@/components/booking/ReviewConfirm";
import PageHeader from "@/components/PageHeader";
import { SUPPORT_PHONE } from "@/lib/bookingDraft";
import { getEquipment, NEARBY_EQUIPMENT } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Review & confirm" };

export function generateStaticParams() {
  return NEARBY_EQUIPMENT.map((e) => ({ id: e.id }));
}

async function Review({ params }: { params: Promise<{ id: string }> }) {
  const item = getEquipment((await params).id);
  if (!item || !item.available) notFound();
  return <ReviewConfirm item={item} />;
}

export default function ReviewPage({ params }: PageProps<"/client/book/[id]/review">) {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-[#f5f6f8]`}>
      <PageHeader
        title="Review & confirm"
        step="Step 3 of 3"
        fallback={ROUTES.home}
        action={
          <a
            href={`tel:${SUPPORT_PHONE}`}
            aria-label="Call support"
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy-950 transition hover:bg-slate-100 active:scale-90"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9.2a2.6 2.6 0 0 1 5 .8c0 1.7-2.5 2.2-2.5 3.8M12 17h.01" />
            </svg>
          </a>
        }
      />
      <Suspense fallback={<div className="m-4 h-[480px] animate-pulse rounded-2xl bg-white" />}>
        <Review params={params} />
      </Suspense>
    </main>
  );
}

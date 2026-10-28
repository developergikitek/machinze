import { notFound } from "next/navigation";

import { getEquipment, NEARBY_EQUIPMENT } from "@/lib/equipment";

import BookingBar from "./BookingBar";
import DetailHeader from "./DetailHeader";
import DetailTabs from "./DetailTabs";
import Gallery from "./Gallery";
import OverviewPanel from "./OverviewPanel";
import ReviewsPanel from "./ReviewsPanel";
import SpecsPanel from "./SpecsPanel";

// params (URL data) yahan padhe jaate hain — page isse <Suspense> me rakhta hai taaki
// navigation turant ho (Cache Components: URL data App Shell me nahi aa sakta)
export default async function EquipmentDetails({ params }: { params: Promise<{ id: string }> }) {
  const item = getEquipment((await params).id);
  if (!item) notFound();

  const similar = NEARBY_EQUIPMENT.filter((e) => e.id !== item.id);

  return (
    <>
      <DetailHeader item={item} />
      <Gallery item={item} />

      <section className="bg-white px-4 pb-4 pt-3.5">
        <h1 className="text-[20px] font-semibold leading-snug tracking-tight text-navy-950">{item.name}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-500">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#f5a91b" aria-hidden>
            <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" />
          </svg>
          <span className="font-medium text-navy-950">{item.rating}</span>
          <span>({item.reviews})</span>
          <span>·</span>
          <span>{item.distanceKm} km</span>
          <span>·</span>
          <span className="truncate">{item.area}</span>
        </p>
      </section>

      <DetailTabs
        tabs={[
          { key: "overview", label: "Overview", content: <OverviewPanel item={item} similar={similar} /> },
          { key: "specs", label: "Specs", content: <SpecsPanel item={item} /> },
          { key: "reviews", label: `Reviews (${item.reviews})`, content: <ReviewsPanel item={item} /> },
        ]}
      />

      <BookingBar item={item} />
    </>
  );
}

import type { Metadata } from "next";

import { jakarta } from "@/app/fonts";
import Greeting from "@/components/home/Greeting";
import HomeHeader from "@/components/home/HomeHeader";
import NearbyEquipment from "@/components/home/NearbyEquipment";
import RecentSearches from "@/components/home/RecentSearches";
import SectionHeader from "@/components/home/SectionHeader";
import StickySearch from "@/components/home/StickySearch";
import Suggestions from "@/components/home/Suggestions";
import { NEARBY_EQUIPMENT } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Home" };

// Home ka header (location + inbox) page ka hissa hai — scroll ke saath upar chala jaata hai, search chipakta hai.
// Native header yahan hidden (app-config → header.hiddenOn). Footer tabs + tracker native.
export default function HomePage() {
  return (
    <main className={`${jakarta.className} fx-stagger flex min-h-dvh flex-col bg-white px-4 pb-10`}>
      <HomeHeader />
      <Greeting />
      <StickySearch />
      <div className="mt-1">
        <RecentSearches />
      </div>

      <section className="mt-8">
        <SectionHeader title="Suggestions" href={ROUTES.search()} />
        <Suggestions />
      </section>

      <div className="mt-8">
        <NearbyEquipment items={NEARBY_EQUIPMENT} />
      </div>
    </main>
  );
}

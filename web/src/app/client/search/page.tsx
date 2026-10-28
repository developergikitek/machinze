import type { Metadata } from "next";
import { Suspense } from "react";

import { jakarta } from "@/app/fonts";
import SearchResults from "@/components/search/SearchResults";

export const metadata: Metadata = { title: "Search" };

// ?q= aur ?category= client pe padhe jaate hain (useSearchParams) — isliye Suspense
export default function SearchPage() {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-white px-4 pb-10 pt-3`}>
      <Suspense>
        <SearchResults />
      </Suspense>
    </main>
  );
}

import type { Metadata } from "next";

import { jakarta } from "@/app/fonts";
import SavedList from "@/components/saved/SavedList";

export const metadata: Metadata = { title: "Liked" };

// Header ("Liked") aur footer tabs native hain
export default function LikedPage() {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-[#f5f6f8]`}>
      <SavedList />
    </main>
  );
}

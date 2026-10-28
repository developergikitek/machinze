import type { Metadata } from "next";

import { jakarta } from "@/app/fonts";
import ProfileHome from "@/components/profile/ProfileHome";

export const metadata: Metadata = { title: "Profile" };

// Header ("Profile") aur footer tabs native hain
export default function ProfilePage() {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-[#f5f6f8]`}>
      <ProfileHome />
    </main>
  );
}

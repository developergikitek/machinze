import type { Metadata } from "next";

import { jakarta } from "@/app/fonts";
import ProfileEdit from "@/components/profile/ProfileEdit";

export const metadata: Metadata = { title: "My profile" };

export default function ProfileEditPage() {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-white px-6 pb-10 pt-6`}>
      <ProfileEdit />
    </main>
  );
}

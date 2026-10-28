import type { Metadata } from "next";

import { jakarta } from "@/app/fonts";
import IdProofForm from "@/components/profile/IdProofForm";

export const metadata: Metadata = { title: "ID proof" };

export default function IdProofPage() {
  return (
    <main className={`${jakarta.className} min-h-dvh bg-[#f5f6f8]`}>
      <IdProofForm />
    </main>
  );
}

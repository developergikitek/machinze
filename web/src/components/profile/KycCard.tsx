import Link from "next/link";

import { docSpec, KycRecord, maskedNumber } from "@/lib/kyc";
import { ROUTES } from "@/lib/routes";

import { ProfileIcons } from "./icons";

// Profile pe ID verification ka status — pehli delivery se pehle zaroori
export default function KycCard({ kyc }: { kyc: KycRecord | null }) {
  if (kyc?.status === "verified") return null;

  const pending = kyc?.status === "pending";
  const rejected = kyc?.status === "rejected";

  return (
    <Link
      href={ROUTES.profileIdProof}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 ${pending ? "bg-blue-50" : rejected ? "bg-red-50" : "bg-amber-50"}`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ${
          pending ? "text-blue-700" : rejected ? "text-red-600" : "text-amber-700"
        }`}
      >
        {ProfileIcons.idCard}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold text-navy-950">
          {pending ? "ID under review" : rejected ? "ID needs another look" : "Verify your ID"}
        </span>
        <span className="block text-[12px] leading-snug text-slate-600">
          {pending
            ? `${docSpec(kyc.docType).label} ${maskedNumber(kyc)} · usually done within 24 hours`
            : rejected
              ? "The photo wasn't clear. Please upload it again."
              : "Required before your first delivery. Takes 2 minutes."}
        </span>
      </span>
      {!pending && (
        <span className="shrink-0 rounded-full bg-navy-950 px-3 py-1.5 text-[12px] font-semibold text-white">
          {rejected ? "Re-upload" : "Verify"}
        </span>
      )}
    </Link>
  );
}

"use client";

import Link from "next/link";

import { Group } from "@/components/equipment/Group";
import { ADDRESSES_KEY, addressTitle } from "@/lib/addresses";
import { ROUTES } from "@/lib/routes";
import { writeStored } from "@/lib/useStoredValue";

import { useAccount } from "./useAccount";

export default function AddressesList() {
  const { ready, addresses } = useAccount();

  if (!ready) return <div className="m-4 h-[300px] animate-pulse rounded-2xl bg-white" />;

  const remove = (id: string) =>
    writeStored(
      "local",
      ADDRESSES_KEY,
      addresses.filter((a) => a.id !== id),
    );

  return (
    <div className="space-y-4 px-4 pb-8 pt-4">
      {addresses.length ? (
        <Group label="Saved sites" footer="New sites are saved when you book. Up to 5 are kept.">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-navy-950">{addressTitle(a)}</p>
                <p className="text-[13px] leading-snug text-slate-500">
                  {a.address}
                  {a.landmark && `, ${a.landmark}`} · {a.pincode}
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  {a.contactName} · +91 {a.contactPhone}
                </p>
              </div>
              <button type="button" onClick={() => remove(a.id)} className="shrink-0 text-[13px] font-semibold text-red-600">
                Remove
              </button>
            </div>
          ))}
        </Group>
      ) : (
        <div className="rounded-2xl bg-white px-6 py-10 text-center">
          <p className="text-[15px] font-semibold text-navy-950">No saved sites yet</p>
          <p className="mt-1 text-[13px] text-slate-500">Sites you deliver to are saved here for faster booking.</p>
          <Link href={ROUTES.search()} className="mt-4 inline-flex h-10 items-center rounded-xl bg-navy-950 px-5 text-[14px] font-semibold text-white">
            Browse equipment
          </Link>
        </div>
      )}
    </div>
  );
}

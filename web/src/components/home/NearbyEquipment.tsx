"use client";

import { useState } from "react";

import { Equipment } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";

import EquipmentTile, { PriceUnit } from "./EquipmentTile";
import SectionHeader from "./SectionHeader";

const UNITS: { key: PriceUnit; label: string }[] = [
  { key: "hour", label: "Per hour" },
  { key: "day", label: "Per day" },
];

export default function NearbyEquipment({ items }: { items: Equipment[] }) {
  const [unit, setUnit] = useState<PriceUnit>("hour");

  return (
    <section>
      <SectionHeader title="Nearby equipment" href={ROUTES.search()} />
      <div role="radiogroup" aria-label="Price unit" className="mb-3 inline-flex rounded-full bg-[#f2f3f5] p-1">
        {UNITS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={unit === key}
            onClick={() => setUnit(key)}
            className={`h-8 rounded-full px-4 text-[13px] font-semibold transition ${
              unit === key ? "bg-white text-navy-950 shadow-[0_1px_3px_rgba(11,20,55,0.15)]" : "text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4">
        {items.map((item) => (
          <EquipmentTile key={item.id} item={item} unit={unit} />
        ))}
      </div>
    </section>
  );
}

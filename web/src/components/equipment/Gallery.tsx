"use client";

import { useState, ViewTransition } from "react";

import FadeImage from "@/components/FadeImage";
import EquipmentArt from "@/components/home/EquipmentArt";
import { Equipment } from "@/lib/equipment";

export default function Gallery({ item }: { item: Equipment }) {
  const images = item.images ?? (item.image ? [item.image] : []);
  const [index, setIndex] = useState(0);

  return (
    // EquipmentTile ke saath same naam → card ki photo yahan morph hoke aati hai
    <ViewTransition name={`equipment-photo-${item.id}`} share="morph" default="none">
    <div className="relative aspect-[16/11] overflow-hidden bg-[#f2f3f5]">
      {images.length ? (
        <div
          className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {images.map((src, i) => (
            <FadeImage key={src} src={src} alt={i === 0 ? item.name : ""} className="h-full w-full shrink-0 snap-center object-cover" />
          ))}
        </div>
      ) : (
        <EquipmentArt kind={item.art} />
      )}

      {item.available && (
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-semibold text-navy-950">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Available
        </span>
      )}
      {images.length > 1 && (
        <span className="absolute bottom-3 right-3 rounded-full bg-navy-950/70 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-white">
          {index + 1} / {images.length}
        </span>
      )}
    </div>
    </ViewTransition>
  );
}

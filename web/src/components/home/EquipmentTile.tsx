"use client";

import Link from "next/link";
import { ViewTransition } from "react";

import FadeImage from "@/components/FadeImage";
import { Equipment, formatINR } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";
import { useIsSaved } from "@/lib/saved";

import EquipmentArt from "./EquipmentArt";

export type PriceUnit = "hour" | "day";

// Horizontal carousel ka card — image upar, saaf text neeche (Uber "Ways to save" jaisa)
type Props = {
  item: Equipment;
  unit: PriceUnit;
  // carousel me 74% chauda; grid / list me poora
  fullWidth?: boolean;
};

export default function EquipmentTile({ item, unit, fullWidth }: Props) {
  const [liked, toggleLiked] = useIsSaved(item);

  return (
    <article className={fullWidth ? "relative" : "relative w-[74%] shrink-0 snap-start"}>
      {/* detail page ki Gallery ke saath same naam → tap pe photo morph hoke badi hoti hai */}
      <ViewTransition name={`equipment-photo-${item.id}`} share="morph" default="none">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
        {item.image ? (
          <FadeImage
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <EquipmentArt kind={item.art} />
        )}
        {item.available && (
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-navy-950">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Available
          </span>
        )}
        <button
          type="button"
          aria-label={liked ? "Unlike" : "Like"}
          aria-pressed={liked}
          onClick={toggleLiked}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 transition active:scale-90"
        >
          <svg
            key={String(liked)}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={liked ? "#ef4444" : "none"}
            stroke={liked ? "#ef4444" : "#0b1437"}
            strokeWidth="2.2"
            className={liked ? "fx-pop" : ""}
            aria-hidden
          >
            <path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7 3.9 4 7.1 4c2 0 3.4 1.1 4.9 2.8C13.5 5.1 14.9 4 16.9 4c3.2 0 5.5 3 4.3 6.6C19.5 15.4 12 20 12 20Z" />
          </svg>
        </button>
      </div>
      </ViewTransition>

      {/* poora card clickable — heart button upar (z-10) alag rehta hai.
          prefetch: detail turant (bina skeleton) render ho, tabhi photo morph banta hai */}
      <Link
        href={ROUTES.equipment(item.id)}
        prefetch={true}
        transitionTypes={["nav-forward"]}
        className="absolute inset-0 rounded-2xl"
        aria-label={item.name}
      />
      <div className="mt-2.5">
        <h3 className="truncate text-[15px] font-bold text-navy-950">{item.name}</h3>
        <p className="mt-0.5 truncate text-[13px] text-slate-500">
          <span className="font-semibold text-navy-950"><span className="text-amber-brand">★</span> {item.rating}</span> · {item.distanceKm} km · {item.area.split(",")[0]}
        </p>
        <p className="mt-1 text-[15px] text-navy-950">
          <b key={unit} className="inline-block animate-rise font-bold motion-reduce:animate-none">
            {formatINR(unit === "hour" ? item.pricePerHour : item.pricePerDay)}
          </b>
          <span className="text-[13px] text-slate-500"> / {unit}</span>
        </p>
      </div>
    </article>
  );
}

import EquipmentTile from "@/components/home/EquipmentTile";
import { Equipment, formatINR } from "@/lib/equipment";

import About from "./About";
import { Group, Row } from "./Group";

const iconButton = "flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f3f5] text-navy-950 transition active:scale-90";

export default function OverviewPanel({ item, similar }: { item: Equipment; similar: Equipment[] }) {
  const weeklySaving = item.pricePerDay * 7 - item.pricePerWeek;
  const initials = item.vendor.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="space-y-6">
      <Group label="Rates" footer="GST 18% extra. Final price shown before you confirm.">
        <Row label="Hourly" value={`${formatINR(item.pricePerHour)} / hr`} />
        <Row label="Daily · 8 hr shift" value={`${formatINR(item.pricePerDay)} / day`} />
        <Row
          label="Weekly"
          value={`${formatINR(item.pricePerWeek)} / week`}
          hint={weeklySaving > 0 ? `Save ${formatINR(weeklySaving)}` : undefined}
        />
        <Row label="Operator" value={item.operatorPerDay > 0 ? `+${formatINR(item.operatorPerDay)} / day` : "Included"} />
        <Row label="Delivery & pickup" value={formatINR(item.deliveryFee)} />
        <Row label="Security deposit" value={`${formatINR(item.deposit)}`} hint="Refundable" />
      </Group>

      <Group label="Included">
        <div className="flex flex-wrap gap-2 px-4 py-3.5">
          {item.features.map((f) => (
            <span key={f.label} className="flex items-center gap-1.5 rounded-lg bg-[#f6f7f9] px-2.5 py-1.5 text-[13px] text-navy-950">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
              {f.label}
            </span>
          ))}
        </div>
      </Group>

      <Group label="About">
        <About text={item.about} />
      </Group>

      <Group label="Rented by">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-950 text-[13px] font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate text-[14px] font-semibold text-navy-950">
              {item.vendor.name}
              {item.vendor.verified && (
                <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0" aria-label="Verified">
                  <circle cx="12" cy="12" r="10" fill="#10b981" />
                  <path d="m7.5 12.5 3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </p>
            <p className="text-[12px] text-slate-500">
              {item.vendor.rating} rating · replies in ~{item.vendor.responseMins} min
            </p>
          </div>
          {/* TODO: in-app chat */}
          <button type="button" aria-label={`Chat with ${item.vendor.name}`} className={iconButton}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 12a8 8 0 0 1-11.8 7L4 20l1-4.2A8 8 0 1 1 20 12Z" />
            </svg>
          </button>
          <a href={`tel:${item.vendor.phone}`} aria-label={`Call ${item.vendor.name}`} className={iconButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20.5 16.6v2.6a1.8 1.8 0 0 1-2 1.8 17.6 17.6 0 0 1-7.7-2.7 17.3 17.3 0 0 1-5.3-5.3A17.6 17.6 0 0 1 2.8 5.3 1.8 1.8 0 0 1 4.6 3.3h2.6a1.8 1.8 0 0 1 1.8 1.5c.1.9.3 1.7.6 2.5a1.8 1.8 0 0 1-.4 1.9l-1.1 1.1a14.4 14.4 0 0 0 5.4 5.4l1.1-1.1a1.8 1.8 0 0 1 1.9-.4c.8.3 1.6.5 2.5.6a1.8 1.8 0 0 1 1.5 1.8Z" />
            </svg>
          </a>
        </div>
      </Group>

      <Group label="Policies">
        <Row label="Cancellation" value="Free up to 6 hr before" />
        <Row label="Fuel" value="First fill included" />
        <Row label="Documents" value="ID + site address" />
      </Group>

      {similar.length > 0 && (
        <section>
          <h3 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-slate-500">Similar nearby</h3>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4">
            {similar.map((e) => (
              <EquipmentTile key={e.id} item={e} unit="day" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

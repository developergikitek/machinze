import Link from "next/link";

import { quantityOf } from "@/lib/bookingDraft";
import { BookingStatus, ConfirmedBooking } from "@/lib/bookingsStore";
import { formatDay, fromISODate } from "@/lib/dates";
import { formatINR, getEquipment } from "@/lib/equipment";
import { ROUTES } from "@/lib/routes";

import StatusPill from "./StatusPill";

export default function BookingCard({ booking, status }: { booking: ConfirmedBooking; status: BookingStatus }) {
  const item = getEquipment(booking.equipmentId);
  if (!item) return null;

  const { draft } = booking;
  const start = fromISODate(draft.startDate);
  const when =
    draft.startDate === draft.endDate ? formatDay(start) : `${formatDay(start)} – ${formatDay(fromISODate(draft.endDate))}`;
  const due = booking.total - booking.paidNow;
  const site = draft.delivery?.site || draft.delivery?.address.split(",")[0];
  const quantity = quantityOf(draft);

  return (
    <article className="relative rounded-2xl bg-white p-4">
      {/* poora card detail kholta hai; andar ke buttons z-10 se alag */}
      <Link href={ROUTES.bookingView(booking.id)} className="absolute inset-0 rounded-2xl" aria-label={`Booking ${booking.id}, ${item.name}`} />

      <div className="flex items-center justify-between">
        <StatusPill status={status} />
        <span className="text-[12px] font-medium text-slate-400">#{booking.id}</span>
      </div>

      <div className="mt-3 flex gap-3">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f2f3f5]">
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element -- backend URLs, sizes unknown
            <img src={item.image} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-navy-950">
            {quantity > 1 && <span className="text-amber-600">{quantity} × </span>}
            {item.name}
          </p>
          <p className="truncate text-[13px] text-slate-600">{when}</p>
          <p className="truncate text-[12px] text-slate-500">
            {draft.durationLabel}
            {site && ` · ${site}`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-[16px] font-semibold text-navy-950">{formatINR(booking.total)}</p>
          <p className="text-[12px] text-slate-500">
            {status === "cancelled"
              ? booking.refund
                ? `${formatINR(booking.refund)} refunded`
                : "No refund"
              : status === "upcoming" && due > 0
                ? `${formatINR(due)} due at delivery`
                : "Paid"}
          </p>
        </div>
        {status === "completed" || status === "cancelled" ? (
          <Link
            href={ROUTES.equipment(item.id)}
            className="relative z-10 flex h-9 items-center rounded-full border border-slate-200 px-4 text-[13px] font-semibold text-navy-950 transition active:scale-95"
          >
            Book again
          </Link>
        ) : (
          <span className="flex items-center gap-1 text-[13px] font-semibold text-navy-950">
            View details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="m9 6 6 6-6 6" />
            </svg>
          </span>
        )}
      </div>
    </article>
  );
}

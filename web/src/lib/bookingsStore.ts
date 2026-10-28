// Confirmed bookings — demo me device pe (localStorage). TODO: bookings API (create + list + get + cancel)

import { BookingDraft, FREE_CANCEL_HOURS, quantityOf, slotStartHour } from "./bookingDraft";
import { addDays, fromISODate, toISODate } from "./dates";
import { Equipment, NEARBY_EQUIPMENT } from "./equipment";
import { quoteDraft } from "./pricing";

export type PayPlan = "full" | "advance";

export type ConfirmedBooking = {
  id: string;
  equipmentId: string;
  // ISO timestamp
  createdAt: string;
  draft: BookingDraft;
  plan: PayPlan;
  total: number;
  paidNow: number;
  cancelledAt?: string;
  refund?: number;
};

export type BookingStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export const BOOKINGS_KEY = "equiprent:bookings";
export const DEMO_SEEDED_KEY = "equiprent:demo-seeded:v1";

// "ER" + 5 digit — demo ke liye; asli id backend dega
export function newBookingId() {
  return `ER${String(Date.now() % 100000).padStart(5, "0")}`;
}

// todayISO = "yyyy-mm-dd" (local) — string compare hi kaafi hai
export function bookingStatus(b: ConfirmedBooking, todayISO: string): BookingStatus {
  if (b.cancelledAt) return "cancelled";
  if (todayISO < b.draft.startDate) return "upcoming";
  if (todayISO > b.draft.endDate) return "completed";
  return "ongoing";
}

export function cancelDeadline(b: ConfirmedBooking) {
  const d = fromISODate(b.draft.startDate);
  d.setHours(slotStartHour(b.draft.slot) - FREE_CANCEL_HOURS, 0, 0, 0);
  return d;
}

// Deadline se pehle pura paisa; baad me delivery charge (har machine ka) kat ke
export function refundFor(b: ConfirmedBooking, item: Equipment, nowMs: number) {
  return nowMs < cancelDeadline(b).getTime() ? b.paidNow : Math.max(0, b.paidNow - item.deliveryFee * quantityOf(b.draft));
}

// TODO: API aane pe hatao — pehli baar har status ki ek demo booking, taaki list khaali na dikhe
export function demoBookings(today: Date): ConfirmedBooking[] {
  const make = (
    id: string,
    equipmentId: string,
    startOffset: number,
    days: number,
    site: string,
    address: string,
    pincode: string,
    plan: PayPlan,
    extra: Partial<ConfirmedBooking> = {},
  ): ConfirmedBooking => {
    const item = NEARBY_EQUIPMENT.find((e) => e.id === equipmentId)!;
    const draft: BookingDraft = {
      equipmentId,
      mode: "days",
      startDate: toISODate(addDays(today, startOffset)),
      endDate: toISODate(addDays(today, startOffset + days - 1)),
      hours: 4,
      shiftHours: 8,
      slot: "9–11 AM",
      withOperator: item.operatorPerDay > 0,
      durationLabel: `${days} day${days === 1 ? "" : "s"} · 8 hr/day`,
      total: 0,
      delivery: { id: `demo-${id}`, site, address, landmark: "", pincode, contactName: "Site Manager", contactPhone: "9876500001" },
    };
    const total = quoteDraft(item, draft).total;
    draft.total = total;
    return {
      id,
      equipmentId,
      // booking hamesha beete hue din me bani ho
      createdAt: addDays(today, Math.min(startOffset - 3, -1)).toISOString(),
      draft,
      plan,
      total,
      paidNow: plan === "full" ? total : Math.round(total * 0.2),
      ...extra,
    };
  };

  return [
    make("ER12569", "gen-125kva", 5, 3, "DLF Site", "Sector 62, Noida", "201309", "advance"),
    make("ER12568", "crane-25t", 0, 2, "Tower B, Green Valley", "Sector 16, Noida", "201301", "full"),
    make("ER12567", "jcb-3dx", -9, 4, "ABC Construction Site", "Sector 18, Noida", "201301", "full"),
    make("ER12560", "jcb-3dx", -20, 1, "Plot 44 Warehouse", "Sector 63, Noida", "201301", "advance", {
      cancelledAt: addDays(today, -22).toISOString(),
    }),
  ].map((b) => (b.cancelledAt ? { ...b, refund: b.paidNow } : b));
}

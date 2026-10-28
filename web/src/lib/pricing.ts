import { quantityOf } from "./bookingDraft";
import { Equipment } from "./equipment";

// TODO: final price backend se (offers, distance-based delivery, taxes)

export const GST_RATE = 0.18;
export const STANDARD_SHIFT_HOURS = 8;
export const EXTENDED_SHIFT_HOURS = 12;
export const EXTENDED_SHIFT_MULTIPLIER = 1.5;
export const MIN_HOURS = 4;
export const MAX_HOURS = 12;

export type Quote = {
  rent: number;
  // "1 week + 2 days × ₹10,000" jaisa — summary me dikhane ke liye
  rentLabel: string;
  operator: number;
  delivery: number;
  gst: number;
  total: number;
};

// rent / operator ek machine ke — quantity se guna. Har machine alag aati hai (delivery bhi ×), har machine ka apna operator.
function finish(item: Equipment, rent: number, rentLabel: string, operator: number, quantity: number): Quote {
  const delivery = item.deliveryFee * quantity;
  const subtotal = (rent + operator) * quantity + delivery;
  const gst = Math.round(subtotal * GST_RATE);
  return {
    rent: rent * quantity,
    rentLabel: quantity > 1 ? `${quantity} × ${rentLabel}` : rentLabel,
    operator: operator * quantity,
    delivery,
    gst,
    total: subtotal + gst,
  };
}

export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// Din ki booking — 7+ din pe weekly rate apne aap; 12 hr shift pe rent/operator 1.5×
export function quoteDays(item: Equipment, days: number, shiftHours: number, withOperator: boolean, quantity = 1): Quote {
  const weeks = Math.floor(days / 7);
  const rest = days % 7;
  const factor = shiftHours === EXTENDED_SHIFT_HOURS ? EXTENDED_SHIFT_MULTIPLIER : 1;
  const rent = Math.round((weeks * item.pricePerWeek + rest * item.pricePerDay) * factor);
  const parts = [weeks && plural(weeks, "week"), rest && plural(rest, "day")].filter(Boolean).join(" + ");
  const operator = withOperator ? Math.round(item.operatorPerDay * days * factor) : 0;
  return finish(item, rent, factor > 1 ? `${parts} · 12 hr shift` : parts, operator, quantity);
}

export function quoteHours(item: Equipment, hours: number, withOperator: boolean, quantity = 1): Quote {
  const operator = withOperator ? Math.round((item.operatorPerDay / STANDARD_SHIFT_HOURS) * hours) : 0;
  return finish(item, item.pricePerHour * hours, plural(hours, "hour"), operator, quantity);
}

// Booking draft se price — Review aur Confirmation dono yahi use karte hain
export function quoteDraft(
  item: Equipment,
  draft: { mode: "days" | "hours"; startDate: string; endDate: string; hours: number; shiftHours: number; withOperator: boolean; quantity?: number },
) {
  const [sy, sm, sd] = draft.startDate.split("-").map(Number);
  const [ey, em, ed] = draft.endDate.split("-").map(Number);
  const days = Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86_400_000) + 1;
  return draft.mode === "days"
    ? quoteDays(item, days, draft.shiftHours, draft.withOperator, quantityOf(draft))
    : quoteHours(item, draft.hours, draft.withOperator, quantityOf(draft));
}

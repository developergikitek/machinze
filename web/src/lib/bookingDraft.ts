// Booking steps ke beech data (dates → delivery → review). Tab band hote hi saaf — sessionStorage.
// TODO: backend pe draft booking banao, sirf id URL me rakho

import type { DeliveryAddress } from "./addresses";

export type BookingDraft = {
  equipmentId: string;
  // Kitni machines (purane drafts/bookings me nahi hai → 1)
  quantity?: number;
  mode: "days" | "hours";
  // aaj se din ka offset nahi — asli tareekh (yyyy-mm-dd), taaki agle din bhi sahi rahe
  startDate: string;
  endDate: string;
  hours: number;
  shiftHours: number;
  slot: string;
  withOperator: boolean;
  durationLabel: string;
  total: number;
  // Delivery step bharta hai
  delivery?: DeliveryAddress;
  notes?: string;
};

// TODO: asli support number
export const SUPPORT_PHONE = "+911800000000";
export const ADVANCE_RATE = 0.2;
export const FREE_CANCEL_HOURS = 6;

// "7–9 AM" → slot shuru hone ka ghanta (24h)
export function slotStartHour(slot: string) {
  const hour = parseInt(slot.split("–")[0], 10);
  return slot.endsWith("PM") && hour < 12 ? hour + 12 : hour;
}

export const quantityOf = (draft: { quantity?: number }) => draft.quantity ?? 1;

export function machinesLabel(quantity: number) {
  return `${quantity} machine${quantity === 1 ? "" : "s"}`;
}

export const draftKey = (equipmentId: string) => `equiprent:draft:${equipmentId}`;

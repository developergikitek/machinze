// Chal rahi booking — native app ka tracker bar /api/active-booking se padhta hai.
// Type mobile/src/activeBooking.ts ke saath same rakhna.

export type BookingStep = "confirmed" | "dispatched" | "onsite";

export type ActiveBooking = {
  id: string;
  equipment: string;
  category: string;
  step: BookingStep;
  etaMinutes: number;
  operator: { name: string; phone: string };
};

// TODO: bookings API — chal rahi booking na ho to null (tracker bar nahi dikhta)
export const ACTIVE_BOOKING: ActiveBooking | null = {
  id: "ER2481",
  equipment: "JCB 3DX Excavator",
  category: "excavators",
  step: "dispatched",
  etaMinutes: 25,
  operator: { name: "Ramesh Kumar", phone: "+919876500000" },
};

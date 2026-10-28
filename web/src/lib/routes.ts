// Customer (client) app ke saare routes — har page app/client/<route>/ me apne folder me.
// Login / onboarding / splash sabke liye common hain, isliye root pe.
export const ROUTES = {
  home: "/client/home",
  search: (params: { q?: string; category?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
    return qs ? `/client/search?${qs}` : "/client/search";
  },
  equipment: (id: string) => `/client/equipment/${id}`,
  book: (id: string) => `/client/book/${id}`,
  bookDelivery: (id: string) => `/client/book/${id}/delivery`,
  bookReview: (id: string) => `/client/book/${id}/review`,
  bookings: "/client/bookings",
  bookingConfirmed: (id: string) => `/client/bookings/confirmed?id=${encodeURIComponent(id)}`,
  bookingView: (id: string) => `/client/bookings/view?id=${encodeURIComponent(id)}`,
  orders: "/client/orders",
  liked: "/client/liked",
  profile: "/client/profile",
  profileEdit: "/client/profile/edit",
  profileIdProof: "/client/profile/id-proof",
  profileAddresses: "/client/profile/addresses",
  notifications: "/client/notifications",
  // Swiggy jaisa location picker (search + current location). next = chunne ke baad kahan jaana hai
  location: (next?: string) => (next ? `/location?next=${encodeURIComponent(next)}` : "/location"),
} as const;

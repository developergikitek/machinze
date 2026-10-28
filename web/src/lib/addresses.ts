// Saved delivery sites — demo me device pe (localStorage). TODO: user profile API

export type DeliveryAddress = {
  id: string;
  site: string;
  address: string;
  landmark: string;
  pincode: string;
  contactName: string;
  contactPhone: string;
  lat?: number;
  lng?: number;
};

export const ADDRESSES_KEY = "equiprent:addresses";
export const MAX_SAVED_ADDRESSES = 5;

export function addressTitle(a: DeliveryAddress) {
  return a.site || a.address.split(",")[0];
}

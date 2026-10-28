import type { AppLocation } from "./appLocation";

// /location page ke search results. Server: app/api/places (abhi OpenStreetMap Photon — free, bina key).
// TODO: production me Google Places / Ola Maps lagao — sirf api/places ki routes badalni hongi.
export type Place = AppLocation & {
  id: string;
  // "Sector 62" / "DLF Cyber Hub"
  title: string;
  // "Noida, Uttar Pradesh 201309"
  subtitle: string;
};

export async function searchPlaces(q: string, near?: AppLocation | null, signal?: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({ q });
  if (near) {
    params.set("lat", String(near.lat));
    params.set("lng", String(near.lng));
  }
  const res = await fetch(`/api/places?${params}`, { signal });
  if (!res.ok) throw new Error("search failed");
  return ((await res.json()) as { places: Place[] }).places;
}

export async function reversePlace(lat: number, lng: number): Promise<AppLocation> {
  const res = await fetch(`/api/places/reverse?lat=${lat}&lng=${lng}`);
  const place = res.ok ? ((await res.json()) as { place: Place | null }).place : null;
  return place ?? { lat, lng, area: "Current location", city: `${lat.toFixed(3)}, ${lng.toFixed(3)}` };
}

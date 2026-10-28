import type { Place } from "@/lib/places";

// OpenStreetMap Photon (komoot) — free, bina API key. Heavy use ke liye apna server / paid provider lagao.
export const PHOTON_URL = "https://photon.komoot.io";
// Sirf India
export const INDIA_BBOX = "68.1,6.5,97.4,35.7";

type Feature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_type?: string;
    osm_id?: number;
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    locality?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    countrycode?: string;
  };
};

export type PhotonResponse = { features?: Feature[] };

function unique(parts: (string | undefined)[]) {
  return parts.filter((p, i, all): p is string => !!p && all.indexOf(p) === i);
}

export function toPlace({ geometry, properties: p }: Feature): Place | null {
  if (p.countrycode && p.countrycode !== "IN") return null;
  const [lng, lat] = geometry.coordinates;
  const street = unique([p.housenumber, p.street]).join(" ");
  const title = p.name || p.district || p.locality || street || p.city;
  if (!title) return null;
  const city = unique([p.city || p.county, p.state]).filter((v) => v !== title).join(", ");
  const subtitle = unique([p.name && street, p.district, p.locality, p.city || p.county, p.state])
    .filter((v) => v !== title)
    .join(", ");
  return {
    id: `${p.osm_type ?? ""}${p.osm_id ?? `${lat},${lng}`}`,
    title,
    subtitle: [subtitle, p.postcode].filter(Boolean).join(" "),
    // Header me "Sector 62, Noida" — area chhota hi rakho
    area: p.district && p.name && p.name !== p.district ? p.district : title,
    city,
    lat,
    lng,
  };
}

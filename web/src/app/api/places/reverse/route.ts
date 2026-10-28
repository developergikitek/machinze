import { PHOTON_URL, PhotonResponse, toPlace } from "../photon";

// GET /api/places/reverse?lat=&lng= → { place } — browser me "Use current location" ke liye
// (app me native khud reverse geocode karta hai)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return Response.json({ place: null }, { status: 400 });

  try {
    const res = await fetch(`${PHOTON_URL}/reverse?lat=${lat}&lon=${lng}&lang=en`, { next: { revalidate: 86_400 } });
    if (!res.ok) throw new Error(String(res.status));
    const [feature] = ((await res.json()) as PhotonResponse).features ?? [];
    const place = feature ? toPlace(feature) : null;
    // GPS point pe exact dukaan/office ka naam nahi — area (sector / locality) dikhao
    return Response.json({ place: place && { ...place, lat, lng } });
  } catch {
    return Response.json({ place: null }, { status: 502 });
  }
}

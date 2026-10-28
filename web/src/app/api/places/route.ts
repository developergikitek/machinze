import type { Place } from "@/lib/places";

import { INDIA_BBOX, PHOTON_URL, PhotonResponse, toPlace } from "./photon";

const LIMIT = 8;

// GET /api/places?q=sector 62&lat=&lng= → { places } (lat/lng ho to paas wale pehle)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return Response.json({ places: [] });

  const params = new URLSearchParams({ q, limit: String(LIMIT), lang: "en", bbox: INDIA_BBOX });
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if (lat && lng) {
    params.set("lat", lat);
    params.set("lon", lng);
  }

  try {
    const res = await fetch(`${PHOTON_URL}/api/?${params}`, { next: { revalidate: 86_400 } });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as PhotonResponse;
    const places = (data.features ?? []).map(toPlace).filter((p): p is Place => !!p);
    return Response.json({ places });
  } catch {
    return Response.json({ places: [], error: "unavailable" }, { status: 502 });
  }
}

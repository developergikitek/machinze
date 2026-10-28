import { ACTIVE_BOOKING } from "@/lib/bookings";

// TODO: logged-in user ki asli ongoing booking (backend). Koi na ho to { booking: null }
export function GET() {
  return Response.json({ booking: ACTIVE_BOOKING }, { headers: { "Cache-Control": "no-store" } });
}

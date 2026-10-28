import { appConfig } from "@/app-config";

export function GET() {
  return Response.json(appConfig, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}

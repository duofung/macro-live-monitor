import { getDashboardPayload } from "@/lib/dashboard-service";

export const runtime = "nodejs";
export const revalidate = 180;

export async function GET() {
  const payload = await getDashboardPayload();

  return Response.json(payload, {
    headers: {
      "Cache-Control": "s-maxage=180, stale-while-revalidate=60",
    },
  });
}

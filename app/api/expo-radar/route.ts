import { NextResponse } from "next/server";

import { getExpoRadarPayload } from "@/lib/expo-service";

export const revalidate = 300;

export async function GET() {
  const payload = await getExpoRadarPayload();
  return NextResponse.json(payload);
}

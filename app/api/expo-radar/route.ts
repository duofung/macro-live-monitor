import { NextResponse } from "next/server";

import { fallbackExpoFeeds } from "@/lib/expo-data";
import { getExpoRadarPayload } from "@/lib/expo-service";
import type { ExpoRadarPayload } from "@/lib/expo-types";

export const revalidate = 300;

function getFallbackPayload(): ExpoRadarPayload {
  return {
    feeds: fallbackExpoFeeds,
    updatedAt: new Date().toISOString(),
    liveCount: 0,
  };
}

export async function GET() {
  const payload = await getExpoRadarPayload().catch(() => getFallbackPayload());
  return NextResponse.json(payload);
}

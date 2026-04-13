import { NextResponse } from "next/server";

import { registryStats, uncoveredHistoricalCompanies } from "@/lib/expo-company-registry";
import { fallbackExpoFeeds } from "@/lib/expo-data";
import { getExpoRadarPayload } from "@/lib/expo-service";
import type { ExpoRadarPayload } from "@/lib/expo-types";

export const revalidate = 300;

function getFallbackPayload(): ExpoRadarPayload {
  return {
    feeds: fallbackExpoFeeds,
    updatedAt: new Date().toISOString(),
    liveCount: 0,
    registryStats,
    uncoveredCompanies: uncoveredHistoricalCompanies.slice(0, 8).map((item) => item.company),
  };
}

export async function GET() {
  const payload = await getExpoRadarPayload().catch(() => getFallbackPayload());
  return NextResponse.json(payload);
}

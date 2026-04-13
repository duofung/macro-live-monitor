import { ExpoRadar } from "@/components/expo-radar";
import { fallbackExpoFeeds } from "@/lib/expo-data";
import { getExpoRadarPayload } from "@/lib/expo-service";
import type { ExpoRadarPayload } from "@/lib/expo-types";

export const dynamic = "force-dynamic";

function getFallbackPayload(): ExpoRadarPayload {
  return {
    feeds: fallbackExpoFeeds,
    updatedAt: new Date().toISOString(),
    liveCount: 0,
  };
}

export default async function HomePage() {
  const payload = await getExpoRadarPayload().catch(() => getFallbackPayload());

  return <ExpoRadar initialPayload={payload} />;
}

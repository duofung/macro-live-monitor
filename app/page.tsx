import { ExpoRadar } from "@/components/expo-radar";
import { getExpoRadarPayload } from "@/lib/expo-service";

export default async function HomePage() {
  const payload = await getExpoRadarPayload();

  return <ExpoRadar initialPayload={payload} />;
}

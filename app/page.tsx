import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardPayload } from "@/lib/dashboard-service";

export const revalidate = 180;
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialData = await getDashboardPayload();

  return <DashboardShell initialData={initialData} />;
}

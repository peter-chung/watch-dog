import { RequireAuth } from "@/components/auth/require-auth";
import { TrackerDetailClient } from "@/components/tracker-detail-client";

type TrackerDetailPageProps = {
  params: Promise<{ trackerId: string }>;
};

export default async function TrackerDetailPage({
  params,
}: TrackerDetailPageProps) {
  const { trackerId } = await params;

  return (
    <RequireAuth>
      <TrackerDetailClient trackerId={trackerId} />
    </RequireAuth>
  );
}

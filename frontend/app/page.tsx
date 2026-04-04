import Link from "next/link";

import { getTrackers } from "@/lib/api";
import { TrackerList } from "@/components/tracker-list";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  let trackers = [];
  let error: string | null = null;

  try {
    trackers = await getTrackers();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load trackers.";
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            View and manage your tracked webpages.
          </p>
        </div>

        <Button asChild>
          <Link href="/trackers/new">New Tracker</Link>
        </Button>
      </div>

      <TrackerList trackers={trackers} />
    </section>
  );
}

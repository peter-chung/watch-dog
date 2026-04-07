"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getTrackers, type Tracker } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { TrackerList } from "@/components/tracker-list";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function DashboardClient() {
  const router = useRouter();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTrackers() {
      try {
        const data = await getTrackers();

        if (!isMounted) {
          return;
        }

        setTrackers(data);
        setError(null);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message =
          err instanceof Error ? err.message : "Failed to load trackers.";

        if (message === "Unauthorized." || message === "Invalid token.") {
          const supabase = createClient();
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTrackers();

    return () => {
      isMounted = false;
    };
  }, [router]);

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

      {isLoading ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Spinner className="size-5" />
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!isLoading && !error ? <TrackerList trackers={trackers} /> : null}
    </section>
  );
}

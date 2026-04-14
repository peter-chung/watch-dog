"use client";

import { type ComponentType, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActivityIcon,
  BellRingIcon,
  Clock3Icon,
  SparklesIcon,
} from "lucide-react";

import { useSupabaseAuth } from "@/components/auth/supabase-auth-provider";
import { getTrackers, type Tracker } from "@/lib/api";
import { TrackerList } from "@/components/tracker-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const WEEK_IN_MS = 7 * DAY_IN_MS;

function isRecent(value: string | null, timeframe: number) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp <= timeframe;
}

function hasStaleCheck(value: string | null) {
  if (!value) {
    return true;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return true;
  }

  return Date.now() - timestamp > DAY_IN_MS;
}

type MetricCardProps = {
  title: string;
  value: number;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: MetricCardProps) {
  return (
    <Card size="sm" className="border-border/70 bg-background/90">
      <CardHeader className="gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="text-xs font-medium uppercase tracking-[0.16em]">
            {title}
          </CardDescription>
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </div>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-3xl">{value}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
    </Card>
  );
}

export function DashboardClient() {
  const router = useRouter();
  const { supabase } = useSupabaseAuth();
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
  }, [router, supabase]);

  const activeTrackers = trackers.filter((tracker) => tracker.is_active).length;
  const inactiveTrackers = trackers.length - activeTrackers;
  const recentChanges = trackers.filter((tracker) =>
    isRecent(tracker.last_changed_at, WEEK_IN_MS)
  ).length;
  const staleTrackers = trackers.filter((tracker) =>
    hasStaleCheck(tracker.last_checked_at)
  ).length;

  return (
    <section className="space-y-6">
      <Card className="border-border/70 pt-0">
        <CardHeader className="gap-4 pt-6 pb-4">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="bg-background/80">
                <ActivityIcon className="size-3.5" />
                Monitoring dashboard
              </Badge>
              <div className="space-y-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                  Keep the tracker list actionable
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Active health stays up front. Selectors, timestamps, and other
                  supporting fields move into tracker details where they are
                  easier to scan without stretching the page.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 pt-0 pb-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Coverage"
            value={trackers.length}
            description="Pages currently monitored."
            icon={ActivityIcon}
          />
          <MetricCard
            title="Active"
            value={activeTrackers}
            description={
              inactiveTrackers > 0
                ? `${inactiveTrackers} paused tracker${inactiveTrackers === 1 ? "" : "s"}.`
                : "All trackers are running."
            }
            icon={BellRingIcon}
          />
          <MetricCard
            title="Recent changes"
            value={recentChanges}
            description="Detected in the last 7 days."
            icon={SparklesIcon}
          />
          <MetricCard
            title="Needs review"
            value={staleTrackers}
            description="Not checked in the last 24 hours."
            icon={Clock3Icon}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Failed to load trackers</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !error ? <TrackerList trackers={trackers} /> : null}
    </section>
  );
}

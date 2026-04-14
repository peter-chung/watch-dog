"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActivityIcon,
  ArrowRightIcon,
  BellRingIcon,
  Clock3Icon,
  EyeIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";

import { useSupabaseAuth } from "@/components/auth/supabase-auth-provider";
import { getTrackers, type Tracker } from "@/lib/api";
import { TrackerList } from "@/components/tracker-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const hasTrackers = trackers.length > 0;

  return (
    <section className="space-y-8">
      <Card className="border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_transparent_35%),linear-gradient(135deg,rgba(24,24,27,0.05),rgba(24,24,27,0.01))]">
        <CardHeader className="gap-4 border-b bg-background/55 py-6 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="bg-background/80">
                <SparklesIcon className="size-3.5" />
                Monitoring overview
              </Badge>
              <div className="space-y-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                  Dashboard
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  Track page changes, review monitoring health, and jump back
                  into the pages that need attention.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline">
                <button type="button" onClick={() => router.refresh()}>
                  <EyeIcon className="size-4" />
                  Refresh view
                </button>
              </Button>
              <Button asChild>
                <Link href="/trackers/new">
                  <PlusIcon className="size-4" />
                  New Tracker
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 py-6 md:grid-cols-2 xl:grid-cols-4">
          <Card size="sm" className="bg-background/80 ring-border/70">
            <CardHeader className="gap-2">
              <Badge variant="secondary" className="w-fit">
                <ActivityIcon className="size-3.5" />
                Coverage
              </Badge>
              <CardTitle className="text-3xl">{trackers.length}</CardTitle>
              <CardDescription>
                Total webpages currently under watch.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card size="sm" className="bg-background/80 ring-border/70">
            <CardHeader className="gap-2">
              <Badge variant="secondary" className="w-fit">
                <BellRingIcon className="size-3.5" />
                Active
              </Badge>
              <CardTitle className="text-3xl">{activeTrackers}</CardTitle>
              <CardDescription>
                {inactiveTrackers > 0
                  ? `${inactiveTrackers} tracker${inactiveTrackers === 1 ? "" : "s"} paused right now.`
                  : "All trackers are currently active."}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card size="sm" className="bg-background/80 ring-border/70">
            <CardHeader className="gap-2">
              <Badge variant="secondary" className="w-fit">
                <SparklesIcon className="size-3.5" />
                Recent Changes
              </Badge>
              <CardTitle className="text-3xl">{recentChanges}</CardTitle>
              <CardDescription>
                Pages that changed within the last 7 days.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card size="sm" className="bg-background/80 ring-border/70">
            <CardHeader className="gap-2">
              <Badge variant="secondary" className="w-fit">
                <Clock3Icon className="size-3.5" />
                Needs Review
              </Badge>
              <CardTitle className="text-3xl">{staleTrackers}</CardTitle>
              <CardDescription>
                Trackers not checked in the last 24 hours.
              </CardDescription>
            </CardHeader>
          </Card>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Failed to load trackers</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !error && hasTrackers && staleTrackers > 0 ? (
        <Alert>
          <Clock3Icon className="size-4" />
          <AlertTitle>Some trackers may need attention</AlertTitle>
          <AlertDescription>
            {staleTrackers} tracker{staleTrackers === 1 ? "" : "s"} have not
            been checked in the last 24 hours. Review the detail pages if that
            looks unexpected.
          </AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !error ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Your trackers
              </h2>
              <Badge variant="outline">{trackers.length}</Badge>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Open a tracker to inspect history, update selectors, or rerun a
              check.
            </p>
          </div>

          {hasTrackers ? (
            <Button asChild variant="ghost">
              <Link href="/trackers/new">
                Add another tracker
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !error ? <TrackerList trackers={trackers} /> : null}
    </section>
  );
}

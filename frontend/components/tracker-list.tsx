"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRightIcon,
  Clock3Icon,
  SearchCheckIcon,
  SparklesIcon,
} from "lucide-react";

import { Tracker } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TrackerListProps = {
  trackers: Tracker[];
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const WEEK_IN_MS = 7 * DAY_IN_MS;

function formatDateTime(value: string | null) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatRelativeTime(value: string | null) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = date.getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  const divisions: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", DAY_IN_MS],
    ["hour", 60 * 60 * 1000],
    ["minute", 60 * 1000],
  ];

  for (const [unit, unitMs] of divisions) {
    if (Math.abs(diffMs) >= unitMs || unit === "minute") {
      return formatter.format(Math.round(diffMs / unitMs), unit);
    }
  }

  return "Just now";
}

function hasRecentChange(value: string | null) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp <= WEEK_IN_MS;
}

function hasStaleCheck(value: string | null) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return true;
  }

  return Date.now() - timestamp > DAY_IN_MS;
}

function getDisplayHost(value: string) {
  try {
    const url = new URL(value);
    return url.hostname || url.host || value;
  } catch {
    const trimmed = value.trim().replace(/^[a-z]+:\/\//i, "");
    const [host] = trimmed.split(/[/?#]/);
    return host || value;
  }
}

export function TrackerList({ trackers }: TrackerListProps) {
  const router = useRouter();

  function openTracker(trackerId: string) {
    router.push(`/trackers/${trackerId}`);
  }

  if (trackers.length === 0) {
    return (
      <EmptyState
        icon={<SearchCheckIcon className="size-5" />}
        title="No trackers yet"
        description="Create your first tracker to start monitoring a webpage and receive change alerts."
        action={
          <Button asChild>
            <Link href="/trackers/new">Create Your First Tracker</Link>
          </Button>
        }
      />
    );
  }

  return (
    <Card className="border-border/70 pt-0">
      <CardHeader className="gap-3 pt-5 pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-xl">Tracker list</CardTitle>
            <CardDescription className="max-w-2xl">
              The table keeps the high-signal fields visible and pushes deeper
              inspection to each tracker page.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit">
            {trackers.length} total
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <div className="divide-y md:hidden">
          {trackers.map((tracker) => {
            const host = getDisplayHost(tracker.url);
            const isStale = hasStaleCheck(tracker.last_checked_at);
            const isRecent = hasRecentChange(tracker.last_changed_at);

            return (
              <button
                key={tracker.id}
                type="button"
                className="relative w-full px-4 py-3 pr-10 text-left transition-colors hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:outline-none"
                onClick={() => openTracker(tracker.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="truncate font-medium">{host}</div>
                  </div>
                  <div className="flex shrink-0 items-start gap-2">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Badge
                        variant={tracker.is_active ? "default" : "secondary"}
                        className="justify-center"
                      >
                        {tracker.is_active ? "Active" : "Paused"}
                      </Badge>
                      {isRecent ? (
                        <Badge variant="secondary">
                          <SparklesIcon className="size-3.5" />
                          Changed
                        </Badge>
                      ) : null}
                      {isStale ? (
                        <Badge variant="outline">
                          <Clock3Icon className="size-3.5" />
                          Stale
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                <ChevronRightIcon className="absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Last change
                    </p>
                    <p className="truncate pt-0.5">
                      {formatRelativeTime(tracker.last_changed_at)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Last check
                    </p>
                    <p className="truncate pt-0.5">
                      {formatRelativeTime(tracker.last_checked_at)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="hidden md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[28%] pl-4">Tracker</TableHead>
              <TableHead className="w-[8rem]">Status</TableHead>
              <TableHead className="w-[9rem]">Signals</TableHead>
              <TableHead className="w-[10rem]">Last change</TableHead>
              <TableHead className="w-[10rem]">Last check</TableHead>
              <TableHead className="w-10 pr-4">
                <span className="sr-only">Open tracker</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trackers.map((tracker) => {
              const host = getDisplayHost(tracker.url);
              const isStale = hasStaleCheck(tracker.last_checked_at);
              const isRecent = hasRecentChange(tracker.last_changed_at);

              return (
                <TableRow
                  key={tracker.id}
                  role="link"
                  tabIndex={0}
                  className="group cursor-pointer focus-visible:bg-muted/40 focus-visible:outline-none [&>td]:py-2.5"
                  onClick={() => openTracker(tracker.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openTracker(tracker.id);
                    }
                  }}
                >
                    <TableCell className="max-w-0 pl-4">
                      <div className="max-w-[20rem]">
                        <div className="truncate font-medium transition-colors group-hover:text-primary group-focus-visible:text-primary">
                          {host}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={tracker.is_active ? "default" : "secondary"}
                        className="justify-center"
                      >
                        {tracker.is_active ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {isRecent ? (
                          <Badge variant="secondary" className="max-w-full">
                            <SparklesIcon className="size-3.5" />
                            Changed
                          </Badge>
                        ) : null}
                        {isStale ? (
                          <Badge variant="outline" className="max-w-full">
                            <Clock3Icon className="size-3.5" />
                            Stale
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="truncate">{formatRelativeTime(tracker.last_changed_at)}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {formatDateTime(tracker.last_changed_at)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="truncate">{formatRelativeTime(tracker.last_checked_at)}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {formatDateTime(tracker.last_checked_at)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="pr-4 text-right">
                      <ChevronRightIcon className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
                    </TableCell>
                  </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}

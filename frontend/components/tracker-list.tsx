import Link from "next/link";
import { ArrowRightIcon, SearchCheckIcon } from "lucide-react";

import { Tracker } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TrackerListProps = {
  trackers: Tracker[];
};

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

export function TrackerList({ trackers }: TrackerListProps) {
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
    <div className="grid gap-5">
      {trackers.map((tracker) => (
        <Card
          key={tracker.id}
          className="border-border/70 pt-0 transition-shadow duration-200 hover:shadow-sm"
        >
          <CardHeader className="gap-4 border-b bg-muted/20 px-4 py-4">
            <CardAction>
              <Badge variant={tracker.is_active ? "default" : "secondary"}>
                {tracker.is_active ? "Active" : "Inactive"}
              </Badge>
            </CardAction>

            <div className="space-y-2">
              <CardTitle className="break-all text-lg leading-7">
                <Link
                  href={`/trackers/${tracker.id}`}
                  className="transition-colors hover:text-primary"
                >
                  {tracker.url}
                </Link>
              </CardTitle>
              <CardDescription className="space-y-1">
                <span className="block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                  CSS selector
                </span>
                <span className="block break-all rounded-md bg-background px-2.5 py-2 font-mono text-xs text-foreground ring-1 ring-border/60">
                  {tracker.selector}
                </span>
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="grid gap-3 pt-5 sm:grid-cols-3">
            <div className="space-y-1 rounded-lg bg-muted/35 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                Alert email
              </p>
              <p className="break-all text-sm leading-6 text-foreground">
                {tracker.email}
              </p>
            </div>

            <div className="space-y-1 rounded-lg bg-muted/35 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                Last checked
              </p>
              <p className="text-sm leading-6 text-foreground">
                {formatDateTime(tracker.last_checked_at)}
              </p>
            </div>

            <div className="space-y-1 rounded-lg bg-muted/35 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                Last changed
              </p>
              <p className="text-sm leading-6 text-foreground">
                {formatDateTime(tracker.last_changed_at)}
              </p>
            </div>
          </CardContent>

          <CardFooter className="items-center justify-between gap-3">
            <p className="max-w-xl text-xs leading-6 text-muted-foreground">
              Monitor settings and change history from the detail view.
            </p>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/trackers/${tracker.id}`}>
                View Details
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

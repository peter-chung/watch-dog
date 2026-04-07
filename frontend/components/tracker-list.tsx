import Link from "next/link";
import { SearchCheckIcon } from "lucide-react";

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

type TrackerListProps = {
  trackers: Tracker[];
};

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
    <div className="grid gap-4">
      {trackers.map((tracker) => (
        <Card key={tracker.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg break-all">
                  <Link
                    href={`/trackers/${tracker.id}`}
                    className="transition-colors hover:text-primary"
                  >
                    {tracker.url}
                  </Link>
                </CardTitle>
                <CardDescription>
                  Selector:{" "}
                  <span className="font-mono text-xs">{tracker.selector}</span>
                </CardDescription>
              </div>

              <Badge variant={tracker.is_active ? "default" : "secondary"}>
                {tracker.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Email:</span>{" "}
              {tracker.email}
            </p>
            <p>
              <span className="font-medium text-foreground">Last checked:</span>{" "}
              {tracker.last_checked_at ?? "Never"}
            </p>
            <p>
              <span className="font-medium text-foreground">Last changed:</span>{" "}
              {tracker.last_changed_at ?? "Never"}
            </p>
            <p>
              <Link
                href={`/trackers/${tracker.id}`}
                className="font-medium text-primary hover:underline"
              >
                View details
              </Link>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import Link from "next/link";

import { Tracker } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TrackerListProps = {
  trackers: Tracker[];
};

export function TrackerList({ trackers }: TrackerListProps) {
  if (trackers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No trackers yet</CardTitle>
          <CardDescription>
            Create your first tracker to start monitoring a webpage.
          </CardDescription>
        </CardHeader>
      </Card>
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

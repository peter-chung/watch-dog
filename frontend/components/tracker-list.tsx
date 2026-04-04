import { Tracker } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
                  {tracker.url}
                </CardTitle>
                <CardDescription>
                  Selector:{" "}
                  <span className="font-mono text-xs">{tracker.selector}</span>
                </CardDescription>
              </div>

              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  tracker.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tracker.is_active ? "Active" : "Inactive"}
              </span>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

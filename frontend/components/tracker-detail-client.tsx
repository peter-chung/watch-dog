"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HistoryIcon } from "lucide-react";

import {
  deleteTracker,
  getTrackerById,
  getTrackerChangeLogs,
  runTrackerCheck,
  updateTracker,
  type ChangeLog,
  type TrackerCheckResult,
  type Tracker,
  type UpdateTrackerPayload,
} from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/empty-state";
import { TrackerEditForm } from "@/components/tracker-edit-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

type TrackerDetailClientProps = {
  trackerId: string;
};

export function TrackerDetailClient({
  trackerId,
}: TrackerDetailClientProps) {
  const router = useRouter();
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [checkResult, setCheckResult] = useState<TrackerCheckResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAuthError = useCallback(
    async (message: string) => {
      if (message === "Unauthorized." || message === "Invalid token.") {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace("/login");
        return true;
      }

      return false;
    },
    [router]
  );

  async function refreshTrackerDetail() {
    const [trackerData, logData] = await Promise.all([
      getTrackerById(trackerId),
      getTrackerChangeLogs(trackerId),
    ]);

    setTracker(trackerData);
    setChangeLogs(logData);
    setError(null);
  }

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadTrackerDetail() {
      try {
        const [trackerData, logData] = await Promise.all([
          getTrackerById(trackerId, { signal: controller.signal }),
          getTrackerChangeLogs(trackerId, { signal: controller.signal }),
        ]);

        if (!isMounted) {
          return;
        }

        setTracker(trackerData);
        setChangeLogs(logData);
        setError(null);
      } catch (err) {
        if (isAbortError(err) || controller.signal.aborted) {
          return;
        }

        if (!isMounted) {
          return;
        }

        const message =
          err instanceof Error ? err.message : "Failed to load tracker.";

        if (await handleAuthError(message)) {
          return;
        }

        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTrackerDetail();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [handleAuthError, trackerId]);

  async function handleSave(payload: UpdateTrackerPayload) {
    setIsSaving(true);

    try {
      const updatedTracker = await updateTracker(trackerId, payload);
      setTracker(updatedTracker);
      setError(null);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRunCheck() {
    setIsRunningCheck(true);
    setError(null);
    setCheckResult(null);

    try {
      const result = await runTrackerCheck(trackerId);
      setCheckResult(result);
      await refreshTrackerDetail();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to run tracker check.";

      if (await handleAuthError(message)) {
        return;
      }

      toast.error("Manual check failed", {
        description: message,
      });
      setError(message);
    } finally {
      setIsRunningCheck(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await deleteTracker(trackerId);
      toast.success("Tracker deleted", {
        description: "The tracker has been removed from your dashboard.",
      });
      setIsDeleteDialogOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete tracker.";
      toast.error("Could not delete tracker", {
        description: message,
      });
      setError(message);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error && !tracker) {
    return (
      <section className="space-y-4">
        <Button asChild variant="ghost">
          <Link href="/">Back to Dashboard</Link>
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Failed to load tracker</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </section>
    );
  }

  if (!tracker) {
    return null;
  }

  return (
    <>
      <section className="space-y-8">
        <div className="space-y-5">
          <Button asChild variant="ghost">
            <Link href="/">Back to Dashboard</Link>
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-heading break-all text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                {tracker.url}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Inspect tracker metadata, edit settings, and review change
                history.
              </p>
            </div>

            <Badge variant={tracker.is_active ? "default" : "secondary"}>
              {tracker.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Action failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="border-border/70 pt-0">
          <CardHeader className="border-b bg-muted/20 px-4 py-4">
            <CardTitle>Tracker Metadata</CardTitle>
            <CardDescription>
              Current configuration and recent activity for this tracker.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-5 text-sm md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2 rounded-lg bg-muted/35 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                Selector
              </p>
              <p className="break-all font-mono text-xs leading-6 text-foreground">
                {tracker.selector}
              </p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/35 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                Alert email
              </p>
              <p className="break-all text-sm leading-6 text-foreground">
                {tracker.email}
              </p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/35 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                Created
              </p>
              <p className="text-sm leading-6 text-foreground">
                {formatDateTime(tracker.created_at)}
              </p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/35 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                Updated
              </p>
              <p className="text-sm leading-6 text-foreground">
                {formatDateTime(tracker.updated_at ?? null)}
              </p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/35 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                Last checked
              </p>
              <p className="text-sm leading-6 text-foreground">
                {formatDateTime(tracker.last_checked_at)}
              </p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/35 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                Last changed
              </p>
              <p className="text-sm leading-6 text-foreground">
                {formatDateTime(tracker.last_changed_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        <TrackerEditForm
          tracker={tracker}
          isSaving={isSaving}
          onSave={handleSave}
        />

        <Card className="border-border/70 pt-0">
          <CardHeader className="border-b bg-muted/20 px-4 py-4">
            <CardTitle>Manual Check</CardTitle>
            <CardDescription>
              Run a check now and refresh this tracker with the latest result.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleRunCheck}
              disabled={isRunningCheck}
            >
              {isRunningCheck ? "Running Check..." : "Run Check"}
            </Button>

            {checkResult ? (
              <div className="space-y-4">
                <Alert
                  variant={
                    checkResult.status === "changed" &&
                    checkResult.email_error == null
                      ? "default"
                      : checkResult.email_error
                        ? "destructive"
                        : "default"
                  }
                >
                  <AlertTitle>Result: {checkResult.status}</AlertTitle>
                  <AlertDescription className="space-y-1.5">
                    <p>{checkResult.message}</p>
                    {typeof checkResult.email_sent === "boolean" ? (
                      <p>Email sent: {checkResult.email_sent ? "Yes" : "No"}</p>
                    ) : null}
                    {checkResult.email_error ? (
                      <p>Email error: {checkResult.email_error}</p>
                    ) : null}
                  </AlertDescription>
                </Alert>

                {checkResult.old_content || checkResult.new_content ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Old Content</p>
                      <div className="rounded-xl border bg-muted/20 p-4 font-mono text-sm leading-7 text-muted-foreground whitespace-pre-wrap break-words">
                        {checkResult.old_content || "Empty"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium text-foreground">New Content</p>
                      <div className="rounded-xl border bg-muted/20 p-4 font-mono text-sm leading-7 text-muted-foreground whitespace-pre-wrap break-words">
                        {checkResult.new_content || "Empty"}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/70 pt-0">
          <CardHeader className="border-b bg-muted/20 px-4 py-4">
            <CardTitle>Change History</CardTitle>
            <CardDescription>
              Previous content snapshots captured for this tracker.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {changeLogs.length === 0 ? (
              <EmptyState
                icon={<HistoryIcon className="size-5" />}
                title="No change history yet"
                description="Once this tracker detects a content update, the previous and new values will appear here."
              />
            ) : (
              changeLogs.map((log) => (
                <div
                  key={log.id}
                  className="space-y-4 rounded-xl border bg-muted/15 p-4 text-sm shadow-sm"
                >
                  <p className="text-sm font-medium tracking-tight text-foreground">
                    {formatDateTime(log.changed_at)}
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Old Content</p>
                      <div className="rounded-xl border bg-background p-4 font-mono text-sm leading-7 text-muted-foreground whitespace-pre-wrap break-words">
                        {log.old_content || "Empty"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium text-foreground">New Content</p>
                      <div className="rounded-xl border bg-background p-4 font-mono text-sm leading-7 text-muted-foreground whitespace-pre-wrap break-words">
                        {log.new_content || "Empty"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/30 pt-0">
          <CardHeader className="border-b bg-destructive/5 px-4 py-4">
            <CardAction>
              <Badge variant="secondary">Danger Zone</Badge>
            </CardAction>
            <CardTitle>Delete Tracker</CardTitle>
            <CardDescription>
              Permanently remove this tracker and stop future checks.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              Delete Tracker
            </Button>
          </CardContent>
        </Card>
      </section>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this tracker?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The tracker will be removed from
              your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="break-all rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            {tracker.url}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete Tracker"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

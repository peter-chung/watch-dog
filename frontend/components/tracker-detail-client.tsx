"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  Clock3Icon,
  PlayIcon,
  Trash2Icon,
} from "lucide-react";

import {
  ApiError,
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
import { useSupabaseAuth } from "@/components/auth/supabase-auth-provider";
import { NotFoundState } from "@/components/not-found-state";
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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function getCheckStatusTone(status: string | undefined) {
  if (status === "changed") {
    return "default" as const;
  }

  if (status === "error") {
    return "destructive" as const;
  }

  return "secondary" as const;
}

type TrackerDetailClientProps = {
  trackerId: string;
};

export function TrackerDetailClient({
  trackerId,
}: TrackerDetailClientProps) {
  const router = useRouter();
  const { supabase } = useSupabaseAuth();
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [checkResult, setCheckResult] = useState<TrackerCheckResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isMissingTracker, setIsMissingTracker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAuthError = useCallback(
    async (message: string) => {
      if (message === "Unauthorized." || message === "Invalid token.") {
        await supabase.auth.signOut();
        router.replace("/login");
        return true;
      }

      return false;
    },
    [router, supabase]
  );

  async function refreshTrackerDetail() {
    const [trackerData, logData] = await Promise.all([
      getTrackerById(trackerId),
      getTrackerChangeLogs(trackerId),
    ]);

    setTracker(trackerData);
    setChangeLogs(logData);
    setError(null);
    setIsMissingTracker(false);
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
        setIsMissingTracker(false);
      } catch (err) {
        if (isAbortError(err) || controller.signal.aborted) {
          return;
        }

        if (!isMounted) {
          return;
        }

        if (err instanceof ApiError && err.status === 404) {
          setIsMissingTracker(true);
          setError(null);
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

  if (isMissingTracker) {
    return (
      <NotFoundState
        badge="Tracker"
        title="Tracker not found"
        description="This tracker does not exist, may have been deleted, or may not belong to your account."
      />
    );
  }

  if (!tracker) {
    return null;
  }

  return (
    <>
      <section className="space-y-8">
        <div className="space-y-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeftIcon className="size-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="rounded-2xl border border-border/70 bg-card px-5 pt-5 pb-4">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={tracker.is_active ? "default" : "secondary"}>
                      {tracker.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {checkResult ? (
                      <Badge variant={getCheckStatusTone(checkResult.status)}>
                        {checkResult.status}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <h1 className="font-heading break-all text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                      {tracker.url}
                    </h1>
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                      Edit the selector, run checks, and review changes without
                      wasting space on filler.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRunCheck}
                    disabled={isRunningCheck}
                  >
                    <PlayIcon className="size-4" />
                    {isRunningCheck ? "Running..." : "Run Check"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="border border-destructive/40"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isDeleting}
                  >
                    <Trash2Icon className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Card size="sm" className="border-border/70 bg-background/90">
                  <CardHeader className="gap-2.5">
                    <CardDescription className="text-xs font-medium uppercase tracking-[0.16em]">
                      Selector
                    </CardDescription>
                    <p className="break-all font-mono text-xs leading-6 text-foreground">
                      {tracker.selector}
                    </p>
                  </CardHeader>
                </Card>

                <Card size="sm" className="border-border/70 bg-background/90">
                  <CardHeader className="gap-2.5">
                    <CardDescription className="text-xs font-medium uppercase tracking-[0.16em]">
                      Last checked
                    </CardDescription>
                    <p className="text-sm leading-6 text-foreground">
                      {formatDateTime(tracker.last_checked_at)}
                    </p>
                  </CardHeader>
                </Card>

                <Card size="sm" className="border-border/70 bg-background/90">
                  <CardHeader className="gap-2.5">
                    <CardDescription className="text-xs font-medium uppercase tracking-[0.16em]">
                      Last changed
                    </CardDescription>
                    <p className="text-sm leading-6 text-foreground">
                      {formatDateTime(tracker.last_changed_at)}
                    </p>
                  </CardHeader>
                </Card>

                <Card size="sm" className="border-border/70 bg-background/90">
                  <CardHeader className="gap-2.5">
                    <CardDescription className="text-xs font-medium uppercase tracking-[0.16em]">
                      Created
                    </CardDescription>
                    <p className="text-sm leading-6 text-foreground">
                      {formatDateTime(tracker.created_at)}
                    </p>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Action failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <TrackerEditForm
          tracker={tracker}
          isSaving={isSaving}
          onSave={handleSave}
        />

        {checkResult ? (
          <Alert
            variant={
              checkResult.status === "changed" && checkResult.email_error == null
                ? "default"
                : checkResult.email_error
                  ? "destructive"
                  : "default"
            }
          >
            <AlertTitle className="flex flex-wrap items-center gap-2 capitalize">
              {checkResult.status}
              {typeof checkResult.email_sent === "boolean" ? (
                <Badge variant="outline">
                  Email {checkResult.email_sent ? "sent" : "not sent"}
                </Badge>
              ) : null}
            </AlertTitle>
            <AlertDescription className="space-y-1.5">
              <p>{checkResult.message}</p>
              {checkResult.email_error ? (
                <p>{checkResult.email_error}</p>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="border-border/70 pt-0">
          <CardHeader className="px-4 py-4">
            <CardTitle className="text-xl">Change History</CardTitle>
            <CardDescription>
              Snapshots from detected content updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 pb-0">
            {changeLogs.length === 0 ? (
              <div className="px-4 py-3 text-center">
                <p className="inline-flex items-center gap-2 text-sm font-medium leading-5 text-foreground">
                  <Clock3Icon className="size-4 text-muted-foreground" />
                  No change history yet
                </p>
                <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                  When this tracker detects an update, the previous and new
                  values will appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px] whitespace-normal">Date</TableHead>
                    <TableHead className="whitespace-normal">Before</TableHead>
                    <TableHead className="whitespace-normal">After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changeLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="align-top whitespace-normal font-medium text-foreground">
                        {formatDateTime(log.changed_at)}
                      </TableCell>
                      <TableCell className="align-top whitespace-normal text-sm leading-6 text-foreground">
                        <div className="whitespace-pre-wrap break-words sm:max-h-32 sm:overflow-y-auto">
                          {log.old_content || "Empty"}
                        </div>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal text-sm leading-6 text-foreground">
                        <div className="whitespace-pre-wrap break-words sm:max-h-32 sm:overflow-y-auto">
                          {log.new_content || "Empty"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </section>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
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

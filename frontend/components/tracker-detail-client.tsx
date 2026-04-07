"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TrackerEditForm } from "@/components/tracker-edit-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

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

    async function loadTrackerDetail() {
      try {
        const [trackerData, logData] = await Promise.all([
          getTrackerById(trackerId),
          getTrackerChangeLogs(trackerId),
        ]);

        if (!isMounted) {
          return;
        }

        setTracker(trackerData);
        setChangeLogs(logData);
        setError(null);
      } catch (err) {
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

      setError(message);
    } finally {
      setIsRunningCheck(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await deleteTracker(trackerId);
      setIsDeleteDialogOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete tracker.";
      setError(message);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (error && !tracker) {
    return (
      <section className="space-y-4">
        <Button asChild variant="ghost">
          <Link href="/">Back to Dashboard</Link>
        </Button>
        <p className="text-sm text-destructive">{error}</p>
      </section>
    );
  }

  if (!tracker) {
    return null;
  }

  return (
    <>
      <section className="space-y-6">
        <div className="space-y-4">
          <Button asChild variant="ghost">
            <Link href="/">Back to Dashboard</Link>
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="break-all text-3xl font-semibold tracking-tight">
                {tracker.url}
              </h1>
              <p className="text-muted-foreground">
                Inspect tracker metadata, edit settings, and review change
                history.
              </p>
            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                tracker.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {tracker.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle>Tracker Metadata</CardTitle>
            <CardDescription>
              Current configuration and recent activity for this tracker.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="font-medium text-foreground">Selector</p>
              <p className="break-all font-mono text-xs text-muted-foreground">
                {tracker.selector}
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Alert Email</p>
              <p className="text-muted-foreground">{tracker.email}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Created</p>
              <p className="text-muted-foreground">
                {formatDateTime(tracker.created_at)}
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Updated</p>
              <p className="text-muted-foreground">
                {formatDateTime(tracker.updated_at ?? null)}
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Last Checked</p>
              <p className="text-muted-foreground">
                {formatDateTime(tracker.last_checked_at)}
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Last Changed</p>
              <p className="text-muted-foreground">
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

        <Card>
          <CardHeader>
            <CardTitle>Manual Check</CardTitle>
            <CardDescription>
              Run a check now and refresh this tracker with the latest result.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleRunCheck}
              disabled={isRunningCheck}
            >
              {isRunningCheck ? "Running Check..." : "Run Check"}
            </Button>

            {checkResult ? (
              <div className="space-y-4 rounded-xl border bg-muted/30 p-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    Result: {checkResult.status}
                  </p>
                  <p className="text-muted-foreground">
                    {checkResult.message}
                  </p>
                  {typeof checkResult.email_sent === "boolean" ? (
                    <p className="text-muted-foreground">
                      Email sent: {checkResult.email_sent ? "Yes" : "No"}
                    </p>
                  ) : null}
                  {checkResult.email_error ? (
                    <p className="text-destructive">
                      Email error: {checkResult.email_error}
                    </p>
                  ) : null}
                </div>

                {checkResult.old_content || checkResult.new_content ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Old Content</p>
                      <div className="rounded-lg bg-background p-3 text-muted-foreground whitespace-pre-wrap break-words">
                        {checkResult.old_content || "Empty"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium text-foreground">New Content</p>
                      <div className="rounded-lg bg-background p-3 text-muted-foreground whitespace-pre-wrap break-words">
                        {checkResult.new_content || "Empty"}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change History</CardTitle>
            <CardDescription>
              Previous content snapshots captured for this tracker.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {changeLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No change history yet.
              </p>
            ) : (
              changeLogs.map((log) => (
                <div
                  key={log.id}
                  className="space-y-4 rounded-xl border p-4 text-sm"
                >
                  <p className="font-medium text-foreground">
                    {formatDateTime(log.changed_at)}
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Old Content</p>
                      <div className="rounded-lg bg-muted/50 p-3 text-muted-foreground whitespace-pre-wrap break-words">
                        {log.old_content || "Empty"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium text-foreground">New Content</p>
                      <div className="rounded-lg bg-muted/50 p-3 text-muted-foreground whitespace-pre-wrap break-words">
                        {log.new_content || "Empty"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delete Tracker</CardTitle>
            <CardDescription>
              Permanently remove this tracker and stop future checks.
            </CardDescription>
          </CardHeader>
          <CardContent>
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

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete this tracker?"
        description="This action cannot be undone. The tracker will be removed from your dashboard."
        confirmLabel="Delete Tracker"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      >
        <p className="break-all rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          {tracker.url}
        </p>
      </ConfirmDialog>
    </>
  );
}

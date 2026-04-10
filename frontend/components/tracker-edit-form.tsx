"use client";

import { useEffect, useState } from "react";
import { SearchCheckIcon } from "lucide-react";
import { toast } from "sonner";

import {
  testTracker,
  type Tracker,
  type UpdateTrackerPayload,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function normalizeUrl(url: string) {
  const trimmed = url.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

type TrackerEditFormProps = {
  tracker: Tracker;
  isSaving: boolean;
  onSave: (payload: UpdateTrackerPayload) => Promise<void>;
};

export function TrackerEditForm({
  tracker,
  isSaving,
  onSave,
}: TrackerEditFormProps) {
  const [url, setUrl] = useState(tracker.url);
  const [selector, setSelector] = useState(tracker.selector);
  const [isActive, setIsActive] = useState(tracker.is_active);
  const [isTesting, setIsTesting] = useState(false);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    setUrl(tracker.url);
    setSelector(tracker.selector);
    setIsActive(tracker.is_active);
    setPreview("");
  }, [tracker]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (!url.trim()) {
        throw new Error("URL is required.");
      }

      if (!selector.trim()) {
        throw new Error("CSS selector is required.");
      }

      await onSave({
        url: normalizeUrl(url),
        selector: selector.trim(),
        is_active: isActive,
      });

      toast.success("Tracker updated", {
        description: "Your tracker settings have been saved.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update tracker.";
      toast.error("Could not update tracker", {
        description: message,
      });
    }
  }

  async function handleTest() {
    setPreview("");
    setIsTesting(true);

    try {
      if (!url.trim()) {
        throw new Error("URL is required.");
      }

      if (!selector.trim()) {
        throw new Error("CSS selector is required.");
      }

      const result = await testTracker({
        url: normalizeUrl(url),
        selector: selector.trim(),
      });

      setPreview(result.preview);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to test selector.";
      toast.error("Could not test selector", {
        description: message,
      });
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <Card className="border-border/70 pt-0">
      <CardHeader className="border-b bg-muted/20 px-4 py-4">
        <CardTitle>Edit Tracker</CardTitle>
        <CardDescription className="max-w-2xl">
          Update the page target, selector, or monitoring status.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-url">URL</Label>
            <Input
              id="edit-url"
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-selector">CSS Selector</Label>
            <Input
              id="edit-selector"
              type="text"
              value={selector}
              onChange={(event) => setSelector(event.target.value)}
              required
            />
          </div>

          <div className="flex max-w-xs items-start justify-between gap-4 text-sm">
            <div className="space-y-1">
              <Label htmlFor="edit-active">Monitoring Status</Label>
              <p className="text-xs leading-6 text-muted-foreground">
                {isActive ? "Tracker is active" : "Tracker is paused"}
              </p>
            </div>
            <Switch
              id="edit-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              aria-label="Toggle tracker active state"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={isSaving || isTesting}
            >
              <SearchCheckIcon className="size-4" />
              {isTesting ? "Testing..." : "Test Selector"}
            </Button>
            <Button type="submit" disabled={isSaving || isTesting}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {preview ? (
            <div className="space-y-2 rounded-xl border bg-muted/25 p-4">
              <p className="text-sm font-medium tracking-tight text-foreground">
                Preview
              </p>
              <p className="break-words text-sm leading-7 text-muted-foreground">
                {preview}
              </p>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

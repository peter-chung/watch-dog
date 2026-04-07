"use client";

import { useEffect, useState } from "react";

import { type Tracker, type UpdateTrackerPayload } from "@/lib/api";
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
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setUrl(tracker.url);
    setSelector(tracker.selector);
    setIsActive(tracker.is_active);
  }, [tracker]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

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

      setSuccessMessage("Tracker updated successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update tracker.";
      setError(message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Tracker</CardTitle>
        <CardDescription>
          Update the page target, selector, or monitoring status.
        </CardDescription>
      </CardHeader>

      <CardContent>
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

          <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="size-4"
            />
            <span>
              {isActive ? "Tracker is active" : "Tracker is paused"}
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {successMessage ? (
            <p className="text-sm text-green-600">{successMessage}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

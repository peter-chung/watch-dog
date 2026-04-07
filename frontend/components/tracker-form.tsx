"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createTracker, testTracker } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function normalizeUrl(url: string) {
  const trimmed = url.trim();

  if (!trimmed) return trimmed;

  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function TrackerForm() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [selector, setSelector] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [preview, setPreview] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      await createTracker({
        url: normalizeUrl(url),
        selector,
      });

      setPreview("");

      setUrl("");
      setSelector("");
      toast.success("Tracker created", {
        description: "Your tracker has been saved and added to the dashboard.",
      });

      router.push("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Could not create tracker", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTest() {
    setPreview("");
    setIsTesting(true);

    try {
      if (!url.trim()) {
        throw new Error("Please enter a URL before testing.");
      }

      if (!selector.trim()) {
        throw new Error("Please enter a CSS selector before testing.");
      }

      const result = await testTracker({
        url: normalizeUrl(url),
        selector,
      });

      setPreview(result.preview);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Selector test failed", {
        description: message,
      });
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <Card className="max-w-3xl border-border/70 pt-0">
      <CardHeader className="border-b bg-muted/20 px-4 py-4">
        <CardTitle>Create Tracker</CardTitle>
        <CardDescription>
          Add a webpage URL and CSS selector to watch. Alerts go to your account
          email automatically.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="text"
              placeholder="example.com/product"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              You can enter example.com — we&apos;ll add https:// for you.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="selector">CSS Selector</Label>
            <Input
              id="selector"
              type="text"
              placeholder=".price or #stock-status"
              value={selector}
              onChange={(event) => setSelector(event.target.value)}
              required
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || isSubmitting}
            >
              {isTesting ? "Testing..." : "Test Selector"}
            </Button>

            <Button type="submit" disabled={isSubmitting || isTesting}>
              {isSubmitting ? "Creating..." : "Create Tracker"}
            </Button>
          </div>

          {preview ? (
            <div className="space-y-2 rounded-xl border bg-muted/25 p-4">
              <p className="text-sm font-medium text-foreground">
                Preview
              </p>
              <p className="break-words text-sm leading-6 text-muted-foreground">
                {preview}
              </p>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

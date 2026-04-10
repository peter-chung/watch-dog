"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, SearchCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { createTracker, testTracker } from "@/lib/api";
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Create a new tracker</CardTitle>
        <CardDescription>
          Add a webpage URL and CSS selector to monitor for changes.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
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
            <p className="text-xs leading-6 text-muted-foreground">
              You can enter example.com. We&apos;ll add https:// for you.
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
            <p className="text-xs leading-6 text-muted-foreground">
              Use the selector for the exact text or element you want to watch.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || isSubmitting}
            >
              <SearchCheckIcon className="size-4" />
              {isTesting ? "Testing..." : "Test Selector"}
            </Button>

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting || isTesting}
            >
              <PlusIcon className="size-4" />
              {isSubmitting ? "Creating..." : "Create Tracker"}
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

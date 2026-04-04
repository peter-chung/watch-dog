"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [preview, setPreview] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await createTracker({
        url: normalizeUrl(url),
        selector,
        email,
      });

      setSuccessMessage("Tracker created successfully.");
      setPreview("");

      setUrl("");
      setSelector("");
      setEmail("");

      router.push("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTest() {
    setError("");
    setSuccessMessage("");
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
      setError(message);
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Create Tracker</CardTitle>
        <CardDescription>
          Add a webpage URL, the CSS selector to watch, and the email to notify.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="email">Notification Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="flex flex-wrap gap-3">
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

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          {successMessage ? (
            <p className="text-sm text-green-600">{successMessage}</p>
          ) : null}

          {preview ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                Preview
              </p>
              <p className="text-sm text-muted-foreground break-words">
                {preview}
              </p>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

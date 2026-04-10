"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlusIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function redirectIfAuthenticated() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/");
      }
    }

    void redirectIfAuthenticated();
  }, [router]);

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
      return;
    }

    setMessage("Account created. Check your email to confirm your account.");
    setIsSubmitting(false);
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-md items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create an account to start managing trackers.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <UserPlusIcon className="size-4" />
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Sign up failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            {message ? (
              <Alert>
                <AlertTitle>Account created</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : null}
          </form>

          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

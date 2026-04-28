"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRoundIcon } from "lucide-react";

import { useSupabaseAuth } from "@/components/auth/supabase-auth-provider";
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

type LoginPageClientProps = {
  initialEmail: string;
  showSignupSuccess: boolean;
  demoStatus?: string;
};

export function LoginPageClient({
  initialEmail,
  showSignupSuccess,
  demoStatus,
}: LoginPageClientProps) {
  const router = useRouter();
  const { isLoading, session, supabase } = useSupabaseAuth();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/dashboard");
    }
  }, [isLoading, router, session]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setIsSubmitting(false);
      return;
    }

    startTransition(() => {
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-md items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Sign in to manage your trackers.
          </CardDescription>
          {showSignupSuccess ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {initialEmail ? (
                <>
                  Account created for{" "}
                  <span className="font-medium text-foreground">
                    {initialEmail}
                  </span>
                  . Confirm your email, then sign in.
                </>
              ) : (
                "Account created. Confirm your email, then sign in."
              )}
            </p>
          ) : null}
          {demoStatus === "unavailable" ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Demo login is not configured yet. Add DEMO_USER_EMAIL and
              DEMO_USER_PASSWORD, then try again.
            </p>
          ) : null}
          {demoStatus === "failed" ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Demo login failed. Check that the demo user exists and the
              configured password is current.
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <KeyRoundIcon className="size-4" />
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Login failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </form>

          <p className="text-sm text-muted-foreground">
            Need an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

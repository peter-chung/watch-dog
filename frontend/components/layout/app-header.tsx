"use client";

import Link from "next/link";
import {
  ActivityIcon,
  KeyRoundIcon,
  PlusIcon,
  UserPlusIcon,
} from "lucide-react";

import { useSupabaseAuth } from "@/components/auth/supabase-auth-provider";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { isLoading, user } = useSupabaseAuth();
  const userEmail = user?.email ?? null;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex min-h-16 items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2.5 rounded-md transition-opacity hover:opacity-90"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ActivityIcon className="size-3.5" />
              </div>
              <p className="truncate font-heading text-base font-semibold tracking-tight text-foreground">
                Watchdog
              </p>
            </Link>
          </div>

          {isLoading ? (
            <div className="h-9 w-32 shrink-0 rounded-md bg-muted/50" />
          ) : userEmail ? (
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button asChild size="sm">
                <Link href="/trackers/new">
                  <PlusIcon className="size-4" />
                  <span className="sm:hidden">New</span>
                  <span className="hidden sm:inline">New Tracker</span>
                </Link>
              </Button>
              <LogoutButton compactOnMobile />
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">
                  <KeyRoundIcon className="size-4" />
                  Login
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">
                  <UserPlusIcon className="size-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

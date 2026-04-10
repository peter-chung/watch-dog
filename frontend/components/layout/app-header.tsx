"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ActivityIcon, PlusIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUserEmail(session?.user.email ?? null);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

          {userEmail ? (
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
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

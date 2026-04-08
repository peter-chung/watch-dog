"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type RequireAuthProps = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const { data } = await supabase.auth.refreshSession();

        if (data.session) {
          setIsAuthorized(true);
          setIsLoading(false);
          setIsRedirecting(false);
          return;
        }
      }

      if (!session) {
        setIsLoading(false);
        setIsRedirecting(true);
        router.replace("/login");
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
      setIsRedirecting(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setIsAuthorized(false);
        setIsLoading(false);
        setIsRedirecting(true);
        router.replace("/login");
        return;
      }

      if (session) {
        setIsAuthorized(true);
        setIsLoading(false);
        setIsRedirecting(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAuthorized) {
    return isRedirecting ? null : null;
  }

  return <>{children}</>;
}

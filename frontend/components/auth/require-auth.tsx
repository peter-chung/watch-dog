"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSupabaseAuth } from "@/components/auth/supabase-auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

type RequireAuthProps = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const { isLoading, refreshSession, session } = useSupabaseAuth();

  useEffect(() => {
    let isMounted = true;

    async function verifySessionBeforeRedirect() {
      if (isLoading || session) {
        return;
      }

      const currentSession = await refreshSession();

      if (isMounted && !currentSession) {
        router.replace("/login");
      }
    }

    void verifySessionBeforeRedirect();

    return () => {
      isMounted = false;
    };
  }, [isLoading, refreshSession, router, session]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}

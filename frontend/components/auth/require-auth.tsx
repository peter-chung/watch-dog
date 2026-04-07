"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAuthorized(false);
        setIsLoading(false);
        setIsRedirecting(true);
        router.replace("/login");
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
      setIsRedirecting(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (!isAuthorized) {
    return isRedirecting ? null : null;
  }

  return <>{children}</>;
}

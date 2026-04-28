"use client";

import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { createClient } from "@/lib/supabase/client";

type SupabaseAuthContextValue = {
  isLoading: boolean;
  refreshSession: () => Promise<Session | null>;
  session: Session | null;
  supabase: SupabaseClient;
  user: User | null;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | undefined>(
  undefined
);

type SupabaseAuthProviderProps = {
  children: ReactNode;
};

export function SupabaseAuthProvider({
  children,
}: SupabaseAuthProviderProps) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    setSession(currentSession);
    setIsLoading(false);

    return currentSession;
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const currentSession = await refreshSession();

      if (!isMounted) {
        return;
      }

      setSession(currentSession);
      setIsLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshSession, supabase]);

  return (
    <SupabaseAuthContext.Provider
      value={{
        isLoading,
        refreshSession,
        session,
        supabase,
        user: session?.user ?? null,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const value = useContext(SupabaseAuthContext);

  if (!value) {
    throw new Error(
      "useSupabaseAuth must be used within a SupabaseAuthProvider."
    );
  }

  return value;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";

import { useSupabaseAuth } from "@/components/auth/supabase-auth-provider";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  compactOnMobile?: boolean;
};

export function LogoutButton({
  compactOnMobile = false,
}: LogoutButtonProps) {
  const router = useRouter();
  const { supabase } = useSupabaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    const { error } = await supabase.auth.signOut();

    setIsSubmitting(false);

    if (error) {
      return;
    }

    router.replace("/login");
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isSubmitting}
      aria-label="Logout"
    >
      {compactOnMobile ? (
        <span className="inline-flex items-center gap-1.5">
          <LogOutIcon className="size-4" />
          {isSubmitting ? "Signing out..." : "Logout"}
        </span>
      ) : isSubmitting ? (
        <>
          <LogOutIcon className="size-4" />
          Signing out...
        </>
      ) : (
        <>
          <LogOutIcon className="size-4" />
          Logout
        </>
      )}
    </Button>
  );
}

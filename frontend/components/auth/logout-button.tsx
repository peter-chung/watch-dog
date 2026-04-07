"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    setIsSubmitting(false);

    if (error) {
      return;
    }

    router.replace("/login");
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? "Signing out..." : "Logout"}
    </Button>
  );
}

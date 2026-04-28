import type { User } from "@supabase/supabase-js";

export const demoUserEmail = process.env.NEXT_PUBLIC_DEMO_USER_EMAIL ?? "";

export function isDemoUser(user: User | null) {
  return (
    Boolean(demoUserEmail) &&
    user?.email?.toLowerCase() === demoUserEmail.toLowerCase()
  );
}

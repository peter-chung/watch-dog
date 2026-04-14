function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

export function getSupabaseEnv() {
  const supabaseUrl = requireEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const supabasePublishableKey = requireEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );

  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}

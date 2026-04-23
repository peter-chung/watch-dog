import { LoginPageClient } from "@/components/auth/login-page-client";

type LoginPageProps = {
  searchParams: Promise<{
    signup?: string | string[];
    email?: string | string[];
  }>;
};

function getSingleValue(value: string | string[] | undefined) {
  if (typeof value === "string") {
    return value;
  }

  return value?.[0];
}

export default async function Page({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const signupStatus = getSingleValue(resolvedSearchParams.signup);
  const initialEmail = getSingleValue(resolvedSearchParams.email) ?? "";

  return (
    <LoginPageClient
      initialEmail={initialEmail}
      showSignupSuccess={signupStatus === "success"}
    />
  );
}

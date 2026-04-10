import { RequireAuth } from "@/components/auth/require-auth";
import { TrackerForm } from "@/components/tracker-form";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <RequireAuth>
      <section className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-2xl items-center">
        <div className="w-full space-y-5">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeftIcon className="size-4" />
              Back to Dashboard
            </Link>
          </Button>

          <TrackerForm />
        </div>
      </section>
    </RequireAuth>
  );
}

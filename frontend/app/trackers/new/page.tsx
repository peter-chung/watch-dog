import { RequireAuth } from "@/components/auth/require-auth";
import { TrackerForm } from "@/components/tracker-form";

export default function Page() {
  return (
    <RequireAuth>
      <section className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            New Tracker
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Add a URL and CSS selector to monitor for changes.
          </p>
        </div>

        <TrackerForm />
      </section>
    </RequireAuth>
  );
}

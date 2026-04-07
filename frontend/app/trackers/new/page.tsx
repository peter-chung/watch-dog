import { RequireAuth } from "@/components/auth/require-auth";
import { TrackerForm } from "@/components/tracker-form";

export default function Page() {
  return (
    <RequireAuth>
      <section className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">New Tracker</h1>
          <p className="text-muted-foreground">
            Add a URL and CSS selector to monitor for changes.
          </p>
        </div>

        <TrackerForm />
      </section>
    </RequireAuth>
  );
}

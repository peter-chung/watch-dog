import { RequireAuth } from "@/components/auth/require-auth";
import { TrackerForm } from "@/components/tracker-form";

export default function Page() {
  return (
    <RequireAuth>
      <section className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-2xl items-center">
        <TrackerForm />
      </section>
    </RequireAuth>
  );
}

import Link from "next/link";
import {
  ArrowRightIcon,
  BellRingIcon,
  Clock3Icon,
  PlayIcon,
  SearchCheckIcon,
} from "lucide-react";

import { loginDemoUser } from "@/app/actions";
import { Button } from "@/components/ui/button";

const demoConfigured =
  Boolean(process.env.DEMO_USER_EMAIL) && Boolean(process.env.DEMO_USER_PASSWORD);

const highlights = [
  {
    icon: SearchCheckIcon,
    title: "Test selectors",
    description: "Preview the exact text Watchdog will monitor before saving.",
  },
  {
    icon: Clock3Icon,
    title: "Track changes",
    description: "Keep a history of previous and new content snapshots.",
  },
  {
    icon: BellRingIcon,
    title: "Send alerts",
    description: "Notify users when a tracked page changes.",
  },
];

export default function HomePage() {
  return (
    <section className="pb-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center py-20 text-center md:py-24">
        <h1 className="font-heading text-6xl font-semibold tracking-tight text-foreground sm:text-7xl md:text-8xl">
          Watchdog
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          Monitor webpage content with a URL and CSS selector. Track changes,
          keep history, and get alerted when selected text updates.
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <form action={loginDemoUser}>
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={!demoConfigured}
            >
              <PlayIcon className="size-4" />
              Try Demo
            </Button>
          </form>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup">
              Create Account
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          {demoConfigured
            ? "The demo is read-only and uses seeded tracker data."
            : "Add demo credentials to enable one-click demo access."}
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-3">
        {highlights.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-lg border bg-background p-4 text-left">
            <Icon className="size-5 text-muted-foreground" />
            <h2 className="mt-3 font-heading text-base font-medium">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

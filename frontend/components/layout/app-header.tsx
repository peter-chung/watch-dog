import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Watchdog
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          </nav>

          <Button asChild>
            <Link href="/trackers/new">New Tracker</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

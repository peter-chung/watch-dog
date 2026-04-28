import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type NotFoundStateProps = {
  badge?: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function NotFoundState({
  badge = "404",
  title,
  description,
  primaryHref = "/dashboard",
  primaryLabel = "Go to Dashboard",
  secondaryHref = "/trackers/new",
  secondaryLabel = "Create Tracker",
}: NotFoundStateProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-3xl items-center justify-center">
      <Card className="w-full max-w-xl border-border/70 pt-0 text-left">
        <CardHeader className="gap-4 border-b bg-muted/20 px-4 py-4">
          <Badge variant="secondary" className="w-fit">
            {badge}
          </Badge>
          <div className="flex size-12 items-center justify-center rounded-xl bg-background text-muted-foreground ring-1 ring-border/60">
            <SearchXIcon className="size-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
            <CardDescription className="max-w-lg">
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Button asChild>
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

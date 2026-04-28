import { EyeIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DemoModeBanner() {
  return (
    <Alert>
      <EyeIcon className="size-4" />
      <AlertTitle>Demo mode is read-only</AlertTitle>
      <AlertDescription>
        You can inspect seeded trackers and change history. Creating, editing,
        deleting, and manual checks are disabled for the demo account.
      </AlertDescription>
    </Alert>
  );
}

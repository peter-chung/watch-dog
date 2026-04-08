import { NotFoundState } from "@/components/not-found-state";

export default function NotFound() {
  return (
    <NotFoundState
      title="Page not found"
      description="The page you were looking for does not exist or may have been moved. Head back to the dashboard to keep managing your trackers."
    />
  );
}

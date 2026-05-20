import { PageSkeleton } from "./States.jsx";

export function RouteLoader() {
  return (
    <main className="route-loader" aria-label="Loading page" role="status">
      <PageSkeleton />
    </main>
  );
}
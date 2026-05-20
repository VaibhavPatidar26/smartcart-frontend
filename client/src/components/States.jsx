function SkeletonLine({ width = "100%" }) {
  return <span className="skeleton-line" style={{ width }} />;
}

export function PageSkeleton({ variant = "default" }) {
  const chartCount = variant === "compact" ? 2 : 4;

  return (
    <div className={`page-skeleton page-skeleton-${variant}`}>
      <section className="skeleton-hero">
        <SkeletonLine width="18%" />
        <SkeletonLine width="62%" />
        <SkeletonLine width="44%" />
      </section>

      <section className="skeleton-stat-grid">
        {[0, 1, 2, 3].map((item) => (
          <div className="skeleton-card" key={item}>
            <SkeletonLine width="46%" />
            <SkeletonLine width="72%" />
          </div>
        ))}
      </section>

      <section className="skeleton-chart-grid">
        {Array.from({ length: chartCount }).map((_, index) => (
          <div className="skeleton-chart" key={index}>
            <SkeletonLine width="34%" />
            <span className="skeleton-block" />
          </div>
        ))}
      </section>
    </div>
  );
}

export function LoadingState({ label = "Loading", variant = "default" }) {
  return (
    <div aria-label={label} role="status">
      <PageSkeleton variant={variant} />
    </div>
  );
}

export function ErrorState({ error }) {
  return <div className="state-box state-box-error">{error?.message || "Something went wrong."}</div>;
}

export function EmptyState({ label }) {
  return <div className="state-box empty-state">{label}</div>;
}
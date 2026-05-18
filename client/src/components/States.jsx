export function LoadingState({ label = "Loading" }) {
  return <div className="state-box">{label}...</div>;
}

export function ErrorState({ error }) {
  return <div className="state-box state-box-error">{error?.message || "Something went wrong."}</div>;
}

export function EmptyState({ label }) {
  return <div className="state-box">{label}</div>;
}

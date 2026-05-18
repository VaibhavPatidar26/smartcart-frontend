export function StatCard({ label, value, helper }) {
  return (
    <section className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </section>
  );
}

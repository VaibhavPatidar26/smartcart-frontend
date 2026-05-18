import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

function money(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function displayText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" || typeof value === "number") return value;

  if (typeof value === "object") {
    if (value.description) return value.description;
    if (value.name) return value.name;
    if (Array.isArray(value.recommendation)) return value.recommendation.join(" ");
    if (value.recommendation) return value.recommendation;
    return fallback;
  }

  return String(value);
}

export function ClusterSummary() {
  const { data, error, loading } = useApi(api.clusterSummary);

  if (loading) return <LoadingState label="Loading cluster summary" />;
  if (error) return <ErrorState error={error} />;

  return (
    <>
      <PageHeader
        eyebrow="Business insights"
        title="Cluster Summary"
        description="Translate machine learning segments into customer profiles and marketing direction."
      />

      <section className="summary-list">
        {data.map((row) => (
          <article className="summary-item" key={row.Cluster}>
            <div className="summary-heading">
              <div>
                <span>Cluster {row.Cluster}</span>
                <h2>{displayText(row.Cluster_Name, `Cluster ${row.Cluster}`)}</h2>
              </div>
              <strong>{row.Response_Rate}% response</strong>
            </div>
            <p>{displayText(row.Description, "No description available")}</p>
            <div className="mini-stat-grid">
              <StatCard label="Customers" value={row.Customer_Count} />
              <StatCard label="Avg Income" value={money(row.Avg_Income)} />
              <StatCard label="Avg Spending" value={money(row.Avg_Spending)} />
              <StatCard label="Avg Recency" value={row.Avg_Recency} />
              <StatCard label="Web Purchases" value={row.Avg_Web_Purchases} />
              <StatCard label="Store Purchases" value={row.Avg_Store_Purchases} />
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

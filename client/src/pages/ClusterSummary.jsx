import { ClipboardList } from "lucide-react";

import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Reveal } from "../components/Reveal.jsx";
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

function recommendationList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value) return [displayText(value)];
  return [];
}

function displayClusterNumber(clusterId) {
  return Number(clusterId) + 1;
}

export function ClusterSummary() {
  const { data, error, loading } = useApi(api.clusterSummary);

  if (loading) return <LoadingState label="Loading cluster summary" />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="page-stack summary-page">
      <PageHeader
        eyebrow="Business insights"
        title="Segment summaries for marketing decisions."
        description="Each customer segment is presented as a focused business profile with response behavior and purchasing indicators."
      />

      <Reveal>
        <section className="content-band editorial-band summary-intro">
          <ClipboardList size={22} aria-hidden="true" />
          <div>
            <h2>Cluster descriptions come from the preserved model metadata.</h2>
            <p>The numeric averages are recalculated from the CSV and model predictions whenever the Flask summary endpoint runs.</p>
          </div>
        </section>
      </Reveal>

      <section className="summary-list redesigned-summary-list">
        {data.map((row, index) => (
          <Reveal key={row.Cluster} delay={index * 80}>
            <article className="summary-item segment-card">
              <div className="summary-heading">
                <div>
                  <span>Cluster {displayClusterNumber(row.Cluster)}</span>
                  <h2>{displayText(row.Cluster_Name, `Cluster ${displayClusterNumber(row.Cluster)}`)}</h2>
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
              {recommendationList(row.Recommendations).length > 0 && (
                <div className="summary-recommendations">
                  <span>Recommendations</span>
                  <ul>
                    {recommendationList(row.Recommendations).map((recommendation) => (
                      <li key={recommendation}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </Reveal>
        ))}
      </section>
    </div>
  );
}

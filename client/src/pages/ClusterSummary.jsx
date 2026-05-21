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

function displayClusterNumber(clusterId) {
  return Number(clusterId) + 1;
}

const FALLBACK_RECOMMENDATIONS = {
  0: [
    "Provide discount coupons.",
    "Promote family-size product bundles with clear savings.",
    "Use web-first reminders because this segment has higher online browsing behavior.",
    "Offer free delivery thresholds to lift basket size without premium positioning.",
    "Send payday and weekend campaigns when household shopping is more likely.",
    "Avoid expensive luxury-first offers until engagement improves.",
  ],
  1: [
    "Provide loyalty programs.",
    "Invite them to points-based reward tiers and repeat-purchase benefits.",
    "Highlight store and catalog exclusives because offline purchasing is stronger.",
    "Bundle high-margin products with limited-time loyalty bonuses.",
    "Use personalized thank-you offers after large purchases.",
    "Avoid heavy blanket discounts that reduce margin from already valuable shoppers.",
  ],
  2: [
    "Provide details about sales and give heavy discount coupons.",
    "Run reactivation campaigns with simple, time-limited offers.",
    "Use email and web retargeting to remind them about current promotions.",
    "Recommend entry-level bundles before pushing high-value products.",
    "Test small coupon values first, then increase only for non-responders.",
    "Keep messages direct and price-focused because engagement is low.",
  ],
  3: [
    "Provide premium services.",
    "Offer early access to premium launches and limited collections.",
    "Create VIP bundles around wines, meat, fish, and gold products.",
    "Use concierge-style recommendations instead of broad sale messaging.",
    "Reward loyalty with exclusive experiences rather than large discounts.",
    "Protect margins by focusing on quality, convenience, and exclusivity.",
  ],
};

function recommendationList(row) {
  const raw = row.Recommendations ?? row.recommendations ?? row.recommendation;
  const values = Array.isArray(raw) ? raw : raw ? [displayText(raw)] : FALLBACK_RECOMMENDATIONS[Number(row.Cluster)] || [];
  const seen = new Set();

  return values.filter((value) => {
    const text = displayText(value).trim();
    const key = text.toLowerCase().replace(/[.! ]+$/g, "");
    if (!text || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
              {recommendationList(row).length > 0 && (
                <div className="summary-recommendations">
                  <span>Recommendations</span>
                  <ul>
                    {recommendationList(row).map((recommendation) => (
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

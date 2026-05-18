import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function Home() {
  const { data: metrics, error, loading } = useApi(api.metrics);

  return (
    <>
      <PageHeader
        eyebrow="Retail ML platform"
        title="SmartCart Customer Intelligence"
        description="Understand customer segments, inspect purchasing behavior, and turn model output into marketing actions."
      />

      {loading ? <LoadingState label="Loading overview" /> : null}
      {error ? <ErrorState error={error} /> : null}
      {metrics ? (
        <section className="stat-grid">
          <StatCard label="Total Customers" value={metrics.totalCustomers.toLocaleString()} helper="Loaded from customer CSV" />
          <StatCard label="Average Income" value={formatCurrency(metrics.avgIncome)} helper="Across all customers" />
          <StatCard label="Average Spending" value={formatCurrency(metrics.avgSpending)} helper="Product category total" />
          <StatCard label="Campaign Response" value={`${metrics.responseRate}%`} helper="Historical response rate" />
        </section>
      ) : null}

      <section className="feature-grid">
        <article>
          <h2>Analytics dashboard</h2>
          <p>Explore income, spending, education, family structure, channel behavior, and campaign response patterns.</p>
        </article>
        <article>
          <h2>ML clustering</h2>
          <p>Use the preserved KMeans, PCA, scaler, and feature artifacts to segment customers with the same model pipeline.</p>
        </article>
        <article>
          <h2>Business actions</h2>
          <p>Convert cluster IDs into clear marketing recommendations and persist new customer predictions in MongoDB.</p>
        </article>
      </section>
    </>
  );
}

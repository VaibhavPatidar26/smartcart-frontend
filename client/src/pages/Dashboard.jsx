import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { PlotCard } from "../components/PlotCard.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

function currency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function Dashboard() {
  const { data, error, loading } = useApi(api.dashboard);

  if (loading) return <LoadingState label="Loading dashboard" />;
  if (error) return <ErrorState error={error} />;

  const scatter = data.incomeSpendingPoints || [];

  return (
    <>
      <PageHeader
        eyebrow="Customer analytics"
        title="Dashboard"
        description="A working view of demographics, spending behavior, channel activity, and feature relationships."
      />

      <section className="stat-grid">
        <StatCard label="Total Customers" value={data.metrics.totalCustomers.toLocaleString()} />
        <StatCard label="Average Income" value={currency(data.metrics.avgIncome)} />
        <StatCard label="Average Spending" value={currency(data.metrics.avgSpending)} />
        <StatCard label="Campaign Response" value={`${data.metrics.responseRate}%`} />
      </section>

      <section className="plot-grid two-col">
        <PlotCard title="Income Distribution" data={[{ type: "histogram", x: data.incomeValues, marker: { color: "#0f766e" }, nbinsx: 40 }]} />
        <PlotCard title="Age Distribution" data={[{ type: "histogram", x: data.ageValues, marker: { color: "#7c3aed" }, nbinsx: 35 }]} />
        <PlotCard title="Total Spending Distribution" data={[{ type: "histogram", x: data.spendingValues, marker: { color: "#b45309" }, nbinsx: 40 }]} />
        <PlotCard
          title="Spending by Product"
          data={[{ type: "bar", x: data.productSpending.map((item) => item.product), y: data.productSpending.map((item) => item.totalSpending), marker: { color: "#2563eb" } }]}
        />
        <PlotCard
          title="Education Distribution"
          data={[{ type: "pie", labels: data.educationCounts.map((item) => item.label), values: data.educationCounts.map((item) => item.value), hole: 0.42 }]}
        />
        <PlotCard
          title="Marital Status Distribution"
          data={[{ type: "pie", labels: data.maritalCounts.map((item) => item.label), values: data.maritalCounts.map((item) => item.value), hole: 0.42 }]}
        />
        <PlotCard
          title="Income vs Total Spending"
          data={[{ type: "scatter", mode: "markers", x: scatter.map((item) => item.Income), y: scatter.map((item) => item.Total_Spending), text: scatter.map((item) => `Age ${item.Age}, Recency ${item.Recency}`), marker: { color: "#dc2626", size: 8, opacity: 0.75 } }]}
        />
        <PlotCard title="Monthly Web Visits" data={[{ type: "histogram", x: data.webVisitsValues, marker: { color: "#0891b2" }, nbinsx: 15 }]} />
      </section>

      <PlotCard
        title="Feature Correlation Heatmap"
        className="wide-plot"
        data={[{ type: "heatmap", x: data.correlation.labels, y: data.correlation.labels, z: data.correlation.z, colorscale: "RdBu", zmin: -1, zmax: 1 }]}
        layout={{ height: 620 }}
      />
    </>
  );
}

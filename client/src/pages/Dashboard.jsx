import { Activity, AlertTriangle, BarChart3, TrendingUp } from "lucide-react";

import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { PlotCard } from "../components/PlotCard.jsx";
import { Reveal } from "../components/Reveal.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

function currency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const moneyAxis = {
  tickformat: "~s",
  automargin: true,
};

const countAxis = {
  automargin: true,
  rangemode: "tozero",
};

function outlierTraces(points) {
  const groups = points.reduce((acc, point) => {
    const key = point.Outlier || "Typical";
    acc[key] = acc[key] || [];
    acc[key].push(point);
    return acc;
  }, {});

  return Object.entries(groups).map(([name, rows]) => ({
    type: "scatter",
    mode: "markers",
    name,
    x: rows.map((row) => row.Income),
    y: rows.map((row) => row.Total_Spending),
    text: rows.map((row) => `Age ${row.Age}, Recency ${row.Recency}`),
    marker: {
      color: name === "Outlier" ? "#c2410c" : "#94a3b8",
      size: name === "Outlier" ? 10 : 6,
      opacity: name === "Outlier" ? 0.88 : 0.42,
    },
  }));
}

export function Dashboard() {
  const { data, error, loading } = useApi(api.dashboard);

  if (loading) return <LoadingState label="Loading dashboard" variant="dashboard" />;
  if (error) return <ErrorState error={error} />;

  const scatter = data.incomeSpendingPoints || [];
  const outliers = data.outlierPoints || [];

  return (
    <div className="page-stack dashboard-page">
      <PageHeader
        eyebrow="Customer analytics"
        title="Customer behavior dashboard."
        description="A focused analytics view for spend, value, outliers, and feature relationships from the source customer dataset."
      />

      <Reveal>
        <section className="metric-band">
          <StatCard label="Total Customers" value={data.metrics.totalCustomers.toLocaleString()} helper="Source CSV" />
          <StatCard label="Average Income" value={currency(data.metrics.avgIncome)} helper="All customers" />
          <StatCard label="Average Spending" value={currency(data.metrics.avgSpending)} helper="Product spend" />
          <StatCard label="Campaign Response" value={`${data.metrics.responseRate}%`} helper="Historical rate" />
        </section>
      </Reveal>

      <Reveal>
        <section className="analysis-section">
          <div className="analysis-copy">
            <TrendingUp size={22} aria-hidden="true" />
            <p className="eyebrow">Spending profile</p>
            <h2>Income and spending distributions</h2>
            <p>These charts show how customer income and total category spend are distributed before clustering is applied.</p>
          </div>
          <div className="plot-grid two-col refined-plots">
            <PlotCard
              title="Income Distribution"
              description="Frequency of customers across income ranges."
              data={[{ type: "histogram", x: data.incomeValues, marker: { color: "#1f5f55" }, nbinsx: 40 }]}
              layout={{ xaxis: { ...moneyAxis, title: "Income" }, yaxis: { ...countAxis, title: "Customer count" } }}
            />
            <PlotCard
              title="Total Spending Distribution"
              description="Frequency of customers by total spending across product categories."
              data={[{ type: "histogram", x: data.spendingValues, marker: { color: "#c17b3f" }, nbinsx: 40 }]}
              layout={{ xaxis: { ...moneyAxis, title: "Total spending" }, yaxis: { ...countAxis, title: "Customer count" } }}
            />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="analysis-section">
          <div className="analysis-copy">
            <BarChart3 size={22} aria-hidden="true" />
            <p className="eyebrow">Revenue mix</p>
            <h2>Category spend and value relationships</h2>
            <p>Product category totals and income-to-spend relationships help reveal premium and under-engaged groups.</p>
          </div>
          <div className="plot-grid two-col refined-plots">
            <PlotCard
              title="Spending by Product Category"
              description="Total revenue contribution from each product family."
              data={[{ type: "bar", x: data.productSpending.map((item) => item.product), y: data.productSpending.map((item) => item.totalSpending), marker: { color: "#1f5f55" } }]}
              layout={{ xaxis: { automargin: true, title: "Product category" }, yaxis: { ...moneyAxis, title: "Total spending" } }}
            />
            <PlotCard
              title="Income vs Total Spending"
              description="Each point is a customer; use this to inspect value concentration."
              data={[{ type: "scatter", mode: "markers", x: scatter.map((item) => item.Income), y: scatter.map((item) => item.Total_Spending), text: scatter.map((item) => `Age ${item.Age}, Recency ${item.Recency}`), marker: { color: "#c17b3f", size: 8, opacity: 0.72 } }]}
              layout={{ xaxis: { ...moneyAxis, title: "Income", range: [0, 170000] }, yaxis: { ...moneyAxis, title: "Total spending", range: [0, 2800] } }}
            />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="analysis-section centered-section">
          <div className="analysis-copy compact-copy">
            <AlertTriangle size={22} aria-hidden="true" />
            <p className="eyebrow">Outlier detection</p>
            <h2>Income and spending outliers</h2>
            <p>Outliers are identified with the IQR rule across income and total spending, then highlighted against typical customers.</p>
          </div>
          <PlotCard
            title="Outlier Map - Income vs Total Spending"
            description="Orange points are customers outside the IQR bounds for income or spending."
            className="wide-plot"
            data={outlierTraces(outliers)}
            layout={{ height: 560, xaxis: { ...moneyAxis, title: "Income", range: [0, 170000] }, yaxis: { ...moneyAxis, title: "Total spending", range: [0, 2800] } }}
          />
        </section>
      </Reveal>

      <Reveal>
        <section className="analysis-section centered-section">
          <div className="analysis-copy compact-copy">
            <Activity size={22} aria-hidden="true" />
            <p className="eyebrow">Feature relationships</p>
            <h2>Correlation heatmap</h2>
            <p>Correlation values show which numeric features tend to move together in the customer dataset.</p>
          </div>
          <PlotCard
            title="Feature Correlation Heatmap"
            description="Darker positive or negative cells indicate stronger relationships between features."
            className="wide-plot"
            data={[{ type: "heatmap", x: data.correlation.labels, y: data.correlation.labels, z: data.correlation.z, colorscale: "RdBu", zmin: -1, zmax: 1 }]}
            layout={{ height: 620, xaxis: { automargin: true }, yaxis: { automargin: true } }}
          />
        </section>
      </Reveal>
    </div>
  );
}
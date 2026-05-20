import { Brain, BarChart3, Box } from "lucide-react";

import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { PlotCard } from "../components/PlotCard.jsx";
import { Reveal } from "../components/Reveal.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

function colorForCluster(name, index) {
  const normalized = name.toLowerCase();
  if (normalized.includes("premium")) return "#67d5b5";
  if (normalized.includes("low")) return "#ff8a5b";
  if (normalized.includes("high")) return "#9fb4d9";
  if (normalized.includes("family")) return "#df76b8";
  return ["#8ecae6", "#ff8a5b", "#76d7bd", "#e07bb7", "#a5b4fc", "#facc15"][index % 6];
}

function grouped(points) {
  return points.reduce((groups, point) => {
    const key = point.Cluster_Name || `Cluster ${point.Cluster}`;
    groups[key] = groups[key] || [];
    groups[key].push(point);
    return groups;
  }, {});
}

function orderedGroups(points) {
  const groups = grouped(points);
  const preferred = ["Premium", "Low", "High", "Family"];

  return Object.entries(groups).sort(([a], [b]) => {
    const aIndex = preferred.findIndex((item) => a.toLowerCase().includes(item.toLowerCase()));
    const bIndex = preferred.findIndex((item) => b.toLowerCase().includes(item.toLowerCase()));
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

function clusterTraces3d(points) {
  return orderedGroups(points).map(([name, rows], index) => ({
    type: "scatter3d",
    mode: "markers",
    name,
    x: rows.map((row) => row.PCA1),
    y: rows.map((row) => row.PCA2),
    z: rows.map((row) => row.PCA3),
    text: rows.map((row) => `${name}<br>Income: ${row.Income}<br>Spend: ${row.Total_Spending}`),
    marker: {
      size: 4,
      opacity: 0.84,
      color: colorForCluster(name, index),
    },
  }));
}

function bubbleSize(spending) {
  return Math.max(4, Math.min(22, Math.sqrt(Number(spending || 0)) / 2.1));
}

function spendIncomeTraces(points) {
  return orderedGroups(points).map(([name, rows], index) => ({
    type: "scatter",
    mode: "markers",
    name,
    x: rows.map((row) => row.Income),
    y: rows.map((row) => row.Total_Spending),
    marker: {
      size: rows.map((row) => bubbleSize(row.Total_Spending)),
      color: colorForCluster(name, index),
      opacity: 0.7,
      line: { color: "#26314a", width: 1 },
    },
    hovertemplate: `${name}<br>Income: %{x:$,.0f}<br>Total spending: %{y:,.0f}<extra></extra>`,
  }));
}

const darkClusterLayout = {
  paper_bgcolor: "#111827",
  plot_bgcolor: "#151a2c",
  font: { color: "#f8fafc", family: "Inter, Segoe UI, sans-serif" },
  margin: { t: 24, r: 42, b: 86, l: 92 },
  legend: {
    title: { text: "Cluster_Name" },
    font: { color: "#f8fafc" },
    bgcolor: "rgba(17, 24, 39, 0)",
  },
};

export function ClusterAnalysis() {
  const { data, error, loading } = useApi(api.clusterPoints);

  if (loading) return <LoadingState label="Loading cluster points" variant="compact" />;
  if (error) return <ErrorState error={error} />;

  const clusters = new Set(data.map((point) => point.Cluster_Name || point.Cluster));

  return (
    <div className="page-stack cluster-page">
      <PageHeader
        eyebrow="Agglomerative customer segmentation"
        title="3D PCA projection of customer clusters."
        description="The cluster map uses agglomerative labels and a 3D PCA projection so the customer groups can be inspected from multiple angles."
      />

      <Reveal>
        <section className="cluster-overview-panel">
          <div className="analysis-copy">
            <Brain size={22} aria-hidden="true" />
            <p className="eyebrow">3D PCA projection</p>
            <h2>Customers are grouped by agglomerative clustering and visualized across PCA1, PCA2, and PCA3.</h2>
          </div>
          <div className="stat-grid two-stats score-stats">
            <StatCard label="Customers Plotted" value={data.length.toLocaleString()} helper="From source CSV" />
            <StatCard label="Segments" value={clusters.size} helper="Agglomerative labels" />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="analysis-section centered-section">
          <div className="analysis-copy compact-copy">
            <Box size={22} aria-hidden="true" />
            <p className="eyebrow">3D cluster map</p>
            <h2>3D PCA projection of clusters</h2>
            <p>Drag the chart to rotate the cluster structure and inspect separation between customer groups.</p>
          </div>
          <PlotCard
            title="3D PCA Projection of Clusters"
            description="Agglomerative clusters projected into three PCA dimensions."
            className="wide-plot dark-plot-card cluster-reference-card"
            data={clusterTraces3d(data)}
            layout={{
              ...darkClusterLayout,
              height: 720,
              margin: { t: 18, r: 20, b: 28, l: 20 },
              scene: {
                bgcolor: "#111111",
                camera: { eye: { x: 1.55, y: 1.35, z: 1.1 } },
                xaxis: { title: "PCA1", gridcolor: "#3b5b7f", zerolinecolor: "#5b7598", color: "#f8fafc" },
                yaxis: { title: "PCA2", gridcolor: "#3b5b7f", zerolinecolor: "#5b7598", color: "#f8fafc" },
                zaxis: { title: "PCA3", gridcolor: "#3b5b7f", zerolinecolor: "#5b7598", color: "#f8fafc" },
              },
              legend: { orientation: "h", x: 0.02, y: 1.02, font: { color: "#f8fafc" } },
            }}
          />
        </section>
      </Reveal>

      <Reveal>
        <section className="analysis-section centered-section">
          <div className="analysis-copy compact-copy">
            <BarChart3 size={22} aria-hidden="true" />
            <p className="eyebrow">Cluster comparison</p>
            <h2>Spend vs income by cluster</h2>
            <p>This comparison uses fixed axes like the reference image so the relationship is readable and not visually over-steepened by auto-scaling.</p>
          </div>
          <PlotCard
            title="Cluster Comparison - Spend vs Income"
            description="Bubble size increases with total spending; color represents segment name."
            className="wide-plot dark-plot-card cluster-reference-card"
            data={spendIncomeTraces(data)}
            layout={{
              ...darkClusterLayout,
              height: 640,
              xaxis: {
                title: "Income",
                range: [0, 170000],
                tickformat: "~s",
                gridcolor: "#2a3148",
                zerolinecolor: "#2a3148",
                color: "#f8fafc",
                automargin: true,
              },
              yaxis: {
                title: "Total_Spending",
                range: [0, 2800],
                dtick: 500,
                gridcolor: "#2a3148",
                zerolinecolor: "#2a3148",
                color: "#f8fafc",
                automargin: true,
              },
              legend: { ...darkClusterLayout.legend, x: 0.82, y: 0.92 },
            }}
          />
        </section>
      </Reveal>
    </div>
  );
}

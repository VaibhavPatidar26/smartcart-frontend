import { ChevronRight, GitBranch, Microscope, Search, Target } from "lucide-react";

import { api } from "../api.js";
import { PlotCard } from "../components/PlotCard.jsx";
import { Reveal } from "../components/Reveal.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

const darkModelLayout = {
  height: 390,
  paper_bgcolor: "#151a2c",
  plot_bgcolor: "#151a2c",
  font: { color: "#f8fafc", family: "Inter, Segoe UI, sans-serif" },
  margin: { t: 26, r: 28, b: 72, l: 86 },
  xaxis: {
    title: "k (clusters)",
    color: "#f8fafc",
    gridcolor: "#2a3148",
    zerolinecolor: "#2a3148",
    tickmode: "linear",
    dtick: 2,
    automargin: true,
  },
  yaxis: {
    color: "#f8fafc",
    gridcolor: "#2a3148",
    zerolinecolor: "#2a3148",
    automargin: true,
  },
  legend: {
    font: { color: "#f8fafc" },
  },
};

export function KAnalysis() {
  const { data, error, loading } = useApi(api.kAnalysis);

  if (loading) return <LoadingState label="Calculating KMeans model selection" variant="compact" />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="page-stack diagnostic-page model-selection-page">
      <Reveal>
        <section className="model-selection-reference">
          <div className="model-selection-title">
            <Search size={34} aria-hidden="true" />
            <h1>Model selection</h1>
          </div>

          <div className="plot-grid two-col refined-plots">
            <PlotCard
              title="Elbow Method"
              className="dark-plot-card model-selection-card"
              data={[
                {
                  type: "scatter",
                  mode: "lines+markers",
                  name: "WCSS",
                  showlegend: false,
                  x: data.elbowKValues || data.kValues,
                  y: data.elbowWcss || data.wcss,
                  line: { color: "#6366f1", width: 3 },
                  marker: { color: "#6366f1", size: 7 },
                  hovertemplate: "k=%{x}<br>WCSS=%{y}<extra></extra>",
                },
              ]}
              layout={{
                ...darkModelLayout,
                xaxis: { ...darkModelLayout.xaxis, dtick: 2 },
                yaxis: { ...darkModelLayout.yaxis, title: "WCSS (inertia)", tickformat: "~s" },
              }}
            />
            <PlotCard
              title="Silhouette Analysis"
              className="dark-plot-card model-selection-card"
              data={[
                {
                  type: "scatter",
                  mode: "lines+markers",
                  name: "Silhouette score",
                  showlegend: false,
                  x: data.kValues,
                  y: data.silhouetteScores,
                  line: { color: "#10b981", width: 3 },
                  marker: { color: "#10b981", size: 7 },
                  hovertemplate: "k=%{x}<br>score=%{y}<extra></extra>",
                },
              ]}
              layout={{
                ...darkModelLayout,
                xaxis: { ...darkModelLayout.xaxis, dtick: 2 },
                yaxis: { ...darkModelLayout.yaxis, title: "Silhouette score" },
              }}
            />
          </div>

          <div className="intersection-panel">
            <div className="intersection-copy">
              <GitBranch size={22} aria-hidden="true" />
              <p className="eyebrow">Intersection graph</p>
              <h2>Notebook-style WCSS and silhouette intersection</h2>
              <p>This matches the notebook graph: WCSS is plotted on the left axis and silhouette score on the right axis. The selected K is taken from the intersection region.</p>
            </div>

            <PlotCard
              title="WCSS and Silhouette Intersection"
              className="dark-plot-card model-selection-card intersection-chart"
              data={[
                {
                  type: "scatter",
                  mode: "lines+markers",
                  name: "WCSS",
                  x: data.kValues,
                  y: data.intersectionWcss || data.wcss,
                  yaxis: "y",
                  line: { color: "#6366f1", width: 3 },
                  marker: { color: "#6366f1", size: 7 },
                  hovertemplate: "k=%{x}<br>WCSS=%{y}<extra></extra>",
                },
                {
                  type: "scatter",
                  mode: "lines+markers",
                  name: "Silhouette score",
                  x: data.kValues,
                  y: data.silhouetteScores,
                  yaxis: "y2",
                  line: { color: "#ef4444", dash: "dash", width: 3 },
                  marker: { color: "#ef4444", size: 8, symbol: "x" },
                  hovertemplate: "k=%{x}<br>silhouette=%{y:.4f}<extra></extra>",
                },
              ]}
              layout={{
                ...darkModelLayout,
                height: 460,
                xaxis: { ...darkModelLayout.xaxis, dtick: 1 },
                yaxis: { ...darkModelLayout.yaxis, title: "WCSS", tickformat: "~s" },
                yaxis2: {
                  title: { text: "SS", font: { color: "#fecaca", size: 14 } },
                  color: "#fecaca",
                  overlaying: "y",
                  side: "right",
                  showgrid: false,
                  zeroline: false,
                  automargin: true,
                  tickfont: { color: "#fecaca", size: 12 },
                },
                legend: { x: 0.02, y: 1.14, orientation: "h", font: { color: "#f8fafc" } },
                shapes: [
                  {
                    type: "line",
                    x0: data.selectedK,
                    x1: data.selectedK,
                    y0: 0,
                    y1: 1,
                    xref: "x",
                    yref: "paper",
                    line: { color: "#f97316", dash: "dot", width: 2 },
                  },
                ],
                annotations: [
                  {
                    x: data.selectedK,
                    y: 1,
                    xref: "x",
                    yref: "paper",
                    text: `K = ${data.selectedK}`,
                    showarrow: true,
                    arrowcolor: "#f97316",
                    font: { color: "#fed7aa", size: 14 },
                    bgcolor: "rgba(17, 24, 39, 0.88)",
                    bordercolor: "#f97316",
                  },
                ],
              }}
            />

            <div className="selected-k-result">
              <Target size={22} aria-hidden="true" />
              <span>Selected K</span>
              <strong>{data.selectedK}</strong>
              <small>Notebook-selected K</small>
            </div>
          </div>

          <button className="dataset-preview-toggle" type="button">
            <ChevronRight size={20} aria-hidden="true" />
            <Microscope size={20} aria-hidden="true" />
            <span>Raw dataset preview</span>
          </button>

          <p className="selected-k-note">{data.selectedReason}</p>
        </section>
      </Reveal>
    </div>
  );
}

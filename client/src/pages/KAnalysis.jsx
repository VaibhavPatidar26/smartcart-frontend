import { Activity, BarChart3, GitBranch, LineChart, Target } from "lucide-react";

import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { PlotCard } from "../components/PlotCard.jsx";
import { Reveal } from "../components/Reveal.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

const darkModelLayout = {
  height: 390,
  paper_bgcolor: "#151a2c",
  plot_bgcolor: "#151a2c",
  font: { color: "#f8fafc", family: "Inter, Segoe UI, sans-serif" },
  margin: { t: 24, r: 28, b: 72, l: 86 },
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

function formatNumber(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatScore(value) {
  if (value === null || value === undefined) return "n/a";
  return Number(value).toFixed(4);
}

export function KAnalysis() {
  const { data, error, loading } = useApi(api.kAnalysis);

  if (loading) return <LoadingState label="Calculating KMeans model selection" variant="compact" />;
  if (error) return <ErrorState error={error} />;

  const selectedK = data.selectedK;
  const selectedIndex = data.kValues?.indexOf(selectedK) ?? -1;
  const selectedSilhouette = selectedIndex >= 0 ? data.silhouetteScores?.[selectedIndex] : null;
  const finalWcss = data.elbowWcss?.[data.elbowWcss.length - 1];
  const testedKStart = data.elbowKValues?.[0];
  const testedKEnd = data.elbowKValues?.[data.elbowKValues.length - 1];

  return (
    <div className="page-stack diagnostic-page k-analysis-page">
      <PageHeader
        eyebrow="KMeans diagnostics"
        title="Choosing the customer cluster count."
        description="Elbow, silhouette, and intersection views are combined so the model choice is readable without jumping back into the notebook."
      />

      <Reveal>
        <section className="model-score-panel k-decision-panel">
          <div className="analysis-copy">
            <Target size={22} aria-hidden="true" />
            <p className="eyebrow">Selected result</p>
            <h2>K={selectedK} gives the chosen balance between compact clusters and separated customer groups.</h2>
            <p>{data.selectedReason}</p>
          </div>
          <div className="stat-grid two-stats score-stats">
            <StatCard label="Selected K" value={selectedK} helper="Notebook-selected" />
            <StatCard label="Best silhouette K" value={data.bestSilhouetteK} helper={`Score ${formatScore(data.bestScore)}`} />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="analysis-section k-diagnostic-section">
          <div className="analysis-copy compact-copy">
            <LineChart size={22} aria-hidden="true" />
            <p className="eyebrow">Model fit checks</p>
            <h2>WCSS drops as clusters increase, while silhouette shows how cleanly customers separate.</h2>
            <p>The elbow curve looks for diminishing returns in compactness; the silhouette curve checks whether extra clusters still produce meaningful separation.</p>
          </div>
          <div className="plot-grid two-col refined-plots">
            <PlotCard
              title="Elbow Method"
              description="Lower WCSS means tighter clusters; the useful K is near the bend, before improvements flatten."
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
              description="Higher scores indicate better separated clusters across K values."
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
        </section>
      </Reveal>

      <Reveal>
        <section className="analysis-section k-intersection-section">
          <div className="intersection-panel">
            <div className="intersection-copy">
              <GitBranch size={22} aria-hidden="true" />
              <p className="eyebrow">Intersection graph</p>
              <h2>WCSS and silhouette are compared in one view.</h2>
              <p>The vertical marker shows the selected K. WCSS uses the left axis and silhouette uses the right axis, so compactness and separation can be inspected together.</p>
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
              <small>Silhouette {formatScore(selectedSilhouette)}</small>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="k-insight-strip">
          <article>
            <BarChart3 size={20} aria-hidden="true" />
            <span>Tested K range</span>
            <strong>{testedKStart}-{testedKEnd}</strong>
          </article>
          <article>
            <Activity size={20} aria-hidden="true" />
            <span>Final WCSS</span>
            <strong>{formatNumber(finalWcss)}</strong>
          </article>
          <article>
            <Target size={20} aria-hidden="true" />
            <span>Selected score</span>
            <strong>{formatScore(data.intersectionPoint?.score)}</strong>
          </article>
        </section>
      </Reveal>

      <Reveal>
        <section className="k-reason-panel">
          <Target size={22} aria-hidden="true" />
          <div>
            <p className="eyebrow">Why K = {selectedK}</p>
            <h2>K={selectedK} is selected because it is the point where the model gains useful separation without adding unnecessary extra clusters.</h2>
            <p>
              The elbow curve shows that WCSS reduction starts giving smaller improvements around K={selectedK}, while the silhouette check still supports clear customer separation in the same region. That makes K={selectedK} a balanced choice: compact enough for reliable segments, but simple enough to keep the customer groups interpretable.
            </p>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

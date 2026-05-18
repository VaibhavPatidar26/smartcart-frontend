import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { PlotCard } from "../components/PlotCard.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

export function KAnalysis() {
  const { data, error, loading } = useApi(api.kAnalysis);

  if (loading) return <LoadingState label="Calculating K analysis" />;
  if (error) return <ErrorState error={error} />;

  return (
    <>
      <PageHeader
        eyebrow="Model diagnostics"
        title="K-Value Analysis"
        description="Review elbow and silhouette scores used to understand the customer segmentation model."
      />

      <section className="stat-grid two-stats">
        <StatCard label="Best K" value={data.bestK} helper="Highest silhouette score" />
        <StatCard label="Best Silhouette Score" value={data.bestScore} helper="Range tested: 2 to 10" />
      </section>

      <section className="plot-grid two-col">
        <PlotCard
          title="Elbow Method"
          data={[{ type: "scatter", mode: "lines+markers", x: data.kValues, y: data.wcss, line: { color: "#0f766e", width: 3 }, marker: { size: 9 } }]}
          layout={{ xaxis: { title: "Number of clusters" }, yaxis: { title: "WCSS" } }}
        />
        <PlotCard
          title="Silhouette Scores"
          data={[{ type: "scatter", mode: "lines+markers", x: data.kValues, y: data.silhouetteScores, line: { color: "#7c3aed", width: 3 }, marker: { size: 9 } }]}
          layout={{ xaxis: { title: "Number of clusters" }, yaxis: { title: "Silhouette score" } }}
        />
      </section>

      <section className="content-band">
        <h2>Why this matters</h2>
        <p>KMeans groups similar customers efficiently, while PCA supports clearer visualization and a more compact clustering workflow.</p>
      </section>
    </>
  );
}
